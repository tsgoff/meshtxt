import GlobalState from "./GlobalState.js";
import {BleConnection, Constants, HttpConnection, Protobuf, SerialConnection, Types,} from "@meshtastic/js";
import Database from "./Database.js";

class Connection {

    static clientNotificationListeners = [];
    static traceRouteListeners = [];

    static addClientNotificationListener(listener) {
        this.clientNotificationListeners.push(listener);
    }

    static removeClientNotificationListener(listenerToRemove) {
        this.clientNotificationListeners = this.clientNotificationListeners.filter((listener) => {
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
        await this.connect(new HttpConnection(), {
            address: address,
            fetchInterval: 1000,
            tls: true,
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

        // disconnect and clear ui data
        GlobalState.connection.disconnect();
        GlobalState.isConnected = false;

    }

    static async setupConnectionListeners(connection) {

        // listen for device status changes
        connection.events.onDeviceStatus.subscribe((deviceStatus) => {
            console.log("onDeviceStatus", deviceStatus);
            GlobalState.deviceStatus = deviceStatus;
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
            console.log(`updating last heard for node ${fromNodeId} to ${rxTime}`);
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
            console.log(`updating node user ${fromNodeId}`);
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
        });

        // listen for device status changes
        connection.events.onDeviceStatus.subscribe((data) => {

            // check if device is now disconnected
            if(data === Types.DeviceStatusEnum.DeviceDisconnected){
                this.disconnect();
            }

        });

        // listen for trace routes
        GlobalState.traceRoutesById = {};
        connection.events.onTraceRoutePacket.subscribe((data) => {
            console.log("onTraceRoutePacket", data);
            GlobalState.traceRoutesById[data.id] = data;
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
