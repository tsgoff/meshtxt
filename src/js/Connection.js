import GlobalState from "./GlobalState.js";
import {BleConnection, Constants, HttpConnection, Protobuf, SerialConnection, Types,} from "@meshtastic/js";

class Connection {

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
        // we are doing this to get error info for a request id as it's not provided in the onRoutingPacket event
        connection.events.onFromRadio.subscribe((data) => {
            if(data.payloadVariant.case.toString() === "packet") {
                const meshPacket = data.payloadVariant.value;
                if(meshPacket.payloadVariant.case === "decoded"){
                    const dataPacket = meshPacket.payloadVariant.value;
                    if(dataPacket.portnum === Protobuf.Portnums.PortNum.ROUTING_APP){
                        // todo handle nack for "no channel" etc
                        const ackFrom = meshPacket.from;
                        const requestId = dataPacket.requestId;
                        this.onPacketAck(requestId, ackFrom);
                    }
                }
            }
        });

        // listen for our node number
        connection.events.onMyNodeInfo.subscribe((data) => {
            console.log("onMyNodeInfo", data);
            GlobalState.myNodeId = data.myNodeNum;
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
        connection.events.onMessagePacket.subscribe((data) => {
            console.log("onMessagePacket", data);
            GlobalState.messages.push(data);
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
        });

    }

    static onPacketAck(requestId, ackedByNodeId) {

        console.log(`got ack for request id ${requestId} from ${ackedByNodeId}`);

        // find message by request id
        const message = GlobalState.messages.find((m) => m.id === requestId);
        if(!message){
            return;
        }

        // update ack
        message.acked_by_id = ackedByNodeId;

    }

    static onPacketError(id, error) {

        console.log(`got error for packet id ${id}: ${error}`);

        // find message by request id
        const message = GlobalState.messages.find((m) => m.id === id);
        if(!message){
            return;
        }

        // update error
        message.error = error;

    }

}

export default Connection;
