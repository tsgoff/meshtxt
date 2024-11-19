import GlobalState from "./GlobalState.js";
import {BleConnection, Constants, HttpConnection, Protobuf, SerialConnection, Types,} from "@meshtastic/js";
import Database from "./Database.js";

class Connection {

    static clientNotificationListeners = [];
    static messageListeners = [];
    static traceRouteListeners = [];

    static addClientNotificationListener(listener) {
        this.clientNotificationListeners.push(listener);
    }

    static removeClientNotificationListener(listenerToRemove) {
        this.clientNotificationListeners = this.clientNotificationListeners.filter((listener) => {
            return listener !== listenerToRemove;
        });
    }

    static addMessageListener(listener) {
        this.messageListeners.push(listener);
    }

    static removeMessageListener(listenerToRemove) {
        this.messageListeners = this.messageListeners.filter((listener) => {
            return listener !== listenerToRemove;
        });
    }

    static addTraceRouteListener(listener) {
        this.traceRouteListeners.push(listener);
    }

    static removeTraceRouteListener(listenerToRemove) {
        this.traceRouteListeners = this.traceRouteListeners.filter((listener) => {
            return listener !== listenerToRemove;
        });
    }

    static async connectViaBluetooth() {

        // ensure browser supports web bluetooth
        if(!navigator.bluetooth){
            alert("Web Bluetooth is not supported in this browser");
            return;
        }

        await this.connect(new BleConnection(), {
            filters: [
                {
                    services: [
                        Constants.ServiceUuid,
                    ],
                },
            ],
        });

    }

    static async connectViaSerial() {

        // ensure browser supports web serial
        if(!navigator.serial){
            alert("Web Serial is not supported in this browser");
            return null;
        }

        await this.connect(new SerialConnection(), {
            concurrentLogOutput: true,
        });

    }

    static async connectViaHttp(address) {

        // check if address is https
        const isHttps = address.startsWith("https://");

        // get address without http:// and https://
        const [ _, addressWithoutScheme ] = address.split("://")

        // connect
        await this.connect(new HttpConnection(), {
            address: addressWithoutScheme,
            fetchInterval: 1000,
            tls: isHttps,
        });

    }

    static async connect(connection, connectionArgs) {

        // check if already connected
        if(GlobalState.isConnected){
            alert("Already connected");
            return;
        }

        // reset keep alive state. this forces kept alive pages such as MessageViewer to reset
        // this allows them to be recreated with a new call to the "mounted" function, which sets up new database subscriptions
        // without doing this, when the user opens the MessageViewer when a new database connection was created
        // no events will be fired because the subscription is to a previously closed database instance
        GlobalState.keepAliveKey++;

        // setup connection listeners
        await this.setupConnectionListeners(connection);

        // connect to device
        await connection.connect(connectionArgs);

        // update state
        GlobalState.connection = connection;
        GlobalState.isConnected = true;

    }

    static async disconnect() {

        // do nothing if already disconnected
        if(!GlobalState.isConnected){
            return;
        }

        // fix issue with http connection abort controller
        if(GlobalState.connection instanceof HttpConnection){
            // calling disconnect() on an HttpConnection during the initial config fetching locks up the web page
            // this is caused by an infinite loop of errors with the below message:
            // ERROR	[iMeshDevice:HttpConnection]	ReadFromRadio ❌ signal is aborted without reason
            // to fix this, we are just overwriting the internal abortController with a new instance that won't abort the pending internal http requests
            // this reliably fixes the issue and no longer locks up the page, however we still get packet callbacks until the config phase finishes
            // I don't really care if a few more packets come in after disconnecting, so this will do for now
            // fixme: this should probably be fixed in @meshtastic/js directly, probably by breaking out of the while loop if an abort error is received
            GlobalState.connection.abortController = new AbortController();
        }

        // disconnect
        GlobalState.connection.disconnect();

        // update ui
        GlobalState.isConnected = false;

    }

    static async setupConnectionListeners(connection) {

        // listen for device status changes
        connection.events.onDeviceStatus.subscribe((deviceStatus) => {
            console.log("onDeviceStatus", deviceStatus);
            GlobalState.deviceStatus = deviceStatus;
        });

        // listen for lora config
        connection.events.onConfigPacket.subscribe((configPacket) => {
            if(configPacket.payloadVariant.case.toString() === "lora"){
                GlobalState.loraConfig = configPacket.payloadVariant.value;
            }
        });

        // listen for packets from radio
        // we use this for some packets that don't have their own event listener
        connection.events.onFromRadio.subscribe(async (data) => {

            // handle packets
            // we are doing this to get error info for a request id as it's not provided in the onRoutingPacket event
            if(data.payloadVariant.case.toString() === "packet") {
                const meshPacket = data.payloadVariant.value;
                if(meshPacket.payloadVariant.case === "decoded"){
                    const dataPacket = meshPacket.payloadVariant.value;
                    if(dataPacket.portnum === Protobuf.Portnums.PortNum.ROUTING_APP){
                        // todo handle nack for "no channel" etc
                        const ackFrom = meshPacket.from;
                        const requestId = dataPacket.requestId;
                        await this.onPacketAck(requestId, ackFrom);
                    }
                }
            }

            // handle clientNotification
            if(data.payloadVariant.case.toString() === "clientNotification") {
                const clientNotification = data.payloadVariant.value;
                for(const clientNotificationListener of this.clientNotificationListeners){
                    try {
                        clientNotificationListener(clientNotification);
                    } catch(e){}
                }
            }

        });

        // listen for our node number
        connection.events.onMyNodeInfo.subscribe(async (data) => {
            console.log("onMyNodeInfo", data);
            GlobalState.myNodeId = data.myNodeNum;
            await Database.initDatabase(GlobalState.myNodeId);
        });

        // listen for node info
        GlobalState.nodesById = {};
        connection.events.onNodeInfoPacket.subscribe((data) => {

            console.log("onNodeInfoPacket", data);

            const nodeId = data.num;
            GlobalState.nodesById[nodeId] = data;

            // check if we found our own node info
            if(nodeId === GlobalState.myNodeId){
                GlobalState.myNodeUser = data.user;
            }

        });

        // listen for mesh packets
        connection.events.onMeshPacket.subscribe((data) => {

            console.log("onMeshPacket", data);

            // get packet data
            const rxTime = data.rxTime;
            const fromNodeId = data.from;

            // determine hops away
            const hopStart = data.hopStart;
            const hopLimit = data.hopLimit;
            const hopsAway = (hopStart === 0 || hopLimit > hopStart) ? -1 : hopStart - hopLimit;

            // find node by id or do nothing
            const node = GlobalState.nodesById[fromNodeId];
            if(!node){
                return;
            }

            // update last heard and hops away for the node we received packet from
            node.lastHeard = rxTime;
            node.hopsAway = hopsAway;

        });

        // listen for user info
        connection.events.onUserPacket.subscribe((data) => {

            console.log("onUserPacket", data);

            // get packet data
            const fromNodeId = data.from;
            const user = data.data;

            // find node by id or do nothing
            const node = GlobalState.nodesById[fromNodeId];
            if(!node){
                return;
            }

            // update node user
            node.user = user;

            // todo add new nodes if they don't already exist

        });

        // listen for channels
        GlobalState.channelsByIndex = {};
        connection.events.onChannelPacket.subscribe((data) => {
            console.log("onChannelPacket", data);
            GlobalState.channelsByIndex[data.index] = data;
        });

        // listen for new messages
        connection.events.onMessagePacket.subscribe(async (data) => {
            console.log("onMessagePacket", data);
            await Database.Message.insert(data);
            for(const messageListener of this.messageListeners){
                try {
                    messageListener(data);
                } catch(e){}
            }
        });

        // listen for device status changes
        connection.events.onDeviceStatus.subscribe((data) => {

            // check if device is now disconnected
            if(data === Types.DeviceStatusEnum.DeviceDisconnected){
                this.disconnect();
            }

        });

        // listen for trace routes
        connection.events.onTraceRoutePacket.subscribe(async (data) => {
            console.log("onTraceRoutePacket", data);
            await Database.TraceRoute.insert(data);
            for(const traceRouteListener of this.traceRouteListeners){
                try {
                    traceRouteListener(data);
                } catch(e){}
            }
        });

    }

    static async onPacketAck(requestId, ackedByNodeId) {

        console.log(`got ack for request id ${requestId} from ${ackedByNodeId}`);

        // todo make sure request id was for a message, otherwise we might be updating an older packet for something else
        await Database.Message.setMessageAckedByNodeId(requestId, ackedByNodeId);

    }

}

export default Connection;
