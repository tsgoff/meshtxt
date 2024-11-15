<template>
    <div class="flex bg-gray-100 p-2 border-b">
        <div class="mr-auto">

            <!-- title -->
            <div class="font-semibold">Mesh TXT</div>

            <!-- connected node info -->
            <div v-if="GlobalState.isConnected && GlobalState.myNodeUser" class="text-sm text-green-500">Connected: [{{ GlobalState.myNodeUser.shortName }}] {{ GlobalState.myNodeUser.longName }}</div>
            <div v-else class="text-sm text-red-500">No Device Connected</div>

        </div>
        <div class="my-auto font-semibold">

            <!-- connect button -->
            <button v-if="!GlobalState.isConnected" @click="connect" type="button" class="bg-green-500 text-white px-2 py-1 p-1 rounded shadow hover:bg-green-400">
                Connect
            </button>

            <!-- disconnect button -->
            <button v-else @click="disconnect" type="button" class="bg-gray-500 text-white px-2 py-1 p-1 rounded shadow hover:bg-gray-400">
                Disconnect
            </button>

        </div>
    </div>
</template>

<script>
import {
    BleConnection,
    Constants,
    Protobuf,
    Types,
} from "@meshtastic/js";
import GlobalState from "../js/GlobalState.js";

export default {
    name: 'Header',
    methods: {
        async connect() {

            // create ble connection
            const connection = new BleConnection();

            // setup packet listeners
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

            // connect to device
            await connection.connect({
                filters: [
                    {
                        services: [
                            Constants.ServiceUuid,
                        ],
                    },
                ],
            });

            // update state
            GlobalState.connection = connection;
            GlobalState.isConnected = true;

        },
        async disconnect() {

            // do nothing if already disconnected
            if(!GlobalState.isConnected){
                return;
            }

            // disconnect and clear ui data
            GlobalState.connection.disconnect();
            GlobalState.isConnected = false;

        },
        onPacketAck(requestId, ackedByNodeId) {

            console.log(`got ack for request id ${requestId} from ${ackedByNodeId}`);

            // find message by request id
            const message = GlobalState.messages.find((m) => m.id === requestId);
            if(!message){
                return;
            }

            // update ack
            message.acked_by_id = ackedByNodeId;

        },
    },
    computed: {
        GlobalState() {
            return GlobalState;
        },
    },
}
</script>
