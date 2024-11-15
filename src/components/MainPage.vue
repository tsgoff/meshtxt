<template>
    <div class="flex flex-col h-full max-w-3xl mx-auto border-x bg-gray-300">

        <!-- header -->
        <div class="flex bg-gray-100 p-2 border-b">
            <div class="mr-auto">

                <!-- title -->
                <div class="font-semibold">Mesh TXT</div>

                <!-- connected node info -->
                <div v-if="isConnected && myNodeUser" class="text-sm text-green-500">Connected: [{{ myNodeUser.shortName }}] {{ myNodeUser.longName }}</div>
                <div v-else class="text-sm text-red-500">No Device Connected</div>

            </div>
            <div class="my-auto font-semibold">

                <!-- connect button -->
                <button v-if="!isConnected" @click="connect" type="button" class="bg-green-500 text-white px-2 py-1 p-1 rounded shadow hover:bg-green-400">
                    Connect
                </button>

                <!-- disconnect button -->
                <button v-else @click="disconnect" type="button" class="bg-gray-500 text-white px-2 py-1 p-1 rounded shadow hover:bg-gray-400">
                    Disconnect
                </button>

            </div>
        </div>

        <div class="bg-white border-b border-r border-gray-200">
            <div class="-mb-px flex">
                <div @click="tab = 'channels'" class="w-full border-b-2 py-3 px-1 text-center text-sm font-medium cursor-pointer" :class="[ tab === 'channels' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700']">Channels</div>
                <div @click="tab = 'nodes'" class="w-full border-b-2 py-3 px-1 text-center text-sm font-medium cursor-pointer" :class="[ tab === 'nodes' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700']">Nodes</div>
            </div>
        </div>

        <div class="flex h-full overflow-hidden">

            <!-- side menu -->
            <div class="h-full w-full overflow-y-auto">
                <ChannelsList v-if="tab === 'channels'" :channels="Object.values(channelsByIndex)" :selected-channel-id="selectedChannelId" @channel-click="onChannelClick($event)"/>
                <NodesList v-if="tab === 'nodes'" :nodes="Object.values(nodesById)" :selected-node-id="selectedNodeId" @node-click="onNodeClick($event)"/>
            </div>

            <!-- messaging -->
            <div v-show="(tab === 'channels' && selectedChannelId != null) || (tab === 'nodes' && selectedNodeId != null)" class="w-full flex flex-col h-full">

                <!-- messages -->
                <div id="messages" class="h-full overflow-y-auto bg-gray-50">

                    <div v-if="messages.length > 0" class="flex flex-col-reverse p-3">

                        <div v-for="message of messagesReversed" :key="message.id" class="flex max-w-xl mt-3" :class="{ 'ml-auto pl-4 md:pl-16': isMessageOutbound(message), 'mr-auto pr-4 md:pr-16': isMessageInbound(message) }">

                            <!-- inbound sender -->
                            <div v-if="isMessageInbound(message)" class="mr-2 mt-2">
                                <div class="flex rounded-full h-12 w-12 text-white shadow" :style="{ backgroundColor: NodeUtils.getNodeColour(message.from), color: NodeUtils.getNodeTextColour(message.from)}">
                                    <div class="mx-auto my-auto drop-shadow-sm">{{ getNodeShortName(message.from) }}</div>
                                </div>
                            </div>

                            <div class="flex flex-col" :class="{ 'items-end': isMessageOutbound(message), 'items-start': isMessageInbound(message) }">

                                <!-- sender -->
                                <div v-if="isMessageInbound(message)" class="text-xs text-gray-500">
                                    <span>{{ getNodeLongName(message.from) }}</span>
                                </div>

                                <!-- message content -->
                                <div class="flex">
                                    <div class="border border-gray-300 rounded-xl shadow overflow-hidden" :class="[ isMessageFailed(message) ? 'bg-red-500 text-white' : isMessageOutbound(message) ? 'bg-[#3b82f6] text-white' : 'bg-[#efefef]' ]">

                                        <div class="w-full space-y-0.5 px-2.5 py-1">

                                            <!-- content -->
                                            <div v-if="message.data" style="white-space:pre-wrap;word-break:break-word;font-family:inherit;">{{ message.data }}</div>

                                        </div>

                                    </div>
                                </div>

                                <!-- message state -->
                                <div v-if="isMessageOutbound(message)" class="flex text-right" :class="[ isMessageFailed(message) ? 'text-red-500' : 'text-gray-500' ]">
                                    <div class="flex ml-auto space-x-1">

                                        <!-- state label -->
                                        <div class="my-auto">
                                            <span v-if="isMessageDelivered(message)">Delivered</span>
                                            <span v-else-if="isMessageAcknowledged(message)">Heard by another node</span>
                                            <span v-else>Sending</span>
                                        </div>

                                        <!-- delivered icon -->
                                        <div v-if="isMessageDelivered(message) || (message.type === 'broadcast' && isMessageAcknowledged(message))" class="my-auto">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
                                                <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clip-rule="evenodd" />
                                            </svg>
                                        </div>

                                        <!-- failed icon -->
                                        <div v-else-if="isMessageFailed(message)" class="my-auto">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
                                                <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clip-rule="evenodd" />
                                            </svg>
                                        </div>

                                        <!-- fallback icon -->
                                        <div v-else class="my-auto">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                            </svg>
                                        </div>

                                    </div>
                                </div>

                            </div>

                        </div>

                    </div>

                </div>

                <!-- message composer -->
                <div class="flex bg-gray-100 p-2 border-t space-x-2">

                    <!-- text input -->
                    <textarea
                        :readonly="isSendingMessage"
                        v-model="newMessageText"
                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                        rows="3"
                        placeholder="Send a message..."></textarea>

                    <!-- send button -->
                    <div class="inline-flex rounded-md shadow-sm">
                        <button @click="sendMessage" :disabled="!canSendMessage" type="button" class="h-full my-auto inline-flex items-center rounded-md px-2.5 py-1.5 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2" :class="[ canSendMessage ? 'bg-blue-500 hover:bg-blue-400 focus-visible:outline-blue-500' : 'bg-gray-400 focus-visible:outline-gray-500 cursor-not-allowed']">
                            <span v-if="isSendingMessage">Sending...</span>
                            <span v-else>Send</span>
                        </button>
                    </div>

                </div>

            </div>

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
import moment from "moment";
import ChannelsList from "./channels/ChannelsList.vue";
import NodesList from "./nodes/NodesList.vue";
import NodeUtils from "../js/node_utils.js";

export default {
    name: 'MainPage',
    components: {
        NodesList,
        ChannelsList
    },
    data() {
        return {

            tab: 'channels',
            selectedNodeId: null,
            selectedChannelId: null,

            isConnected: false,
            connection: null,

            myNodeId: null,
            myNodeUser: null,

            channelsByIndex: {},
            nodesById: {},

            newMessageText: "",
            isSendingMessage: false,
            messages: [],



        };
    },
    mounted() {

    },
    methods: {
        async connect() {

            // create ble connection
            this.connection = new BleConnection();

            // setup packet listeners
            this.connection.events.onFromRadio.subscribe((data) => {
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
            this.connection.events.onMyNodeInfo.subscribe((data) => {
                console.log("onMyNodeInfo", data);
                this.myNodeId = data.myNodeNum;
            });

            // listen for node info
            this.nodesById = {};
            this.connection.events.onNodeInfoPacket.subscribe((data) => {

                console.log("onNodeInfoPacket", data);

                const nodeId = data.num;
                this.nodesById[nodeId] = data;

                // check if we found our own node info
                if(nodeId === this.myNodeId){
                    this.myNodeUser = data.user;
                }

            });

            // listen for channels
            this.channelsByIndex = {};
            this.connection.events.onChannelPacket.subscribe((data) => {
                console.log("onChannelPacket", data);
                this.channelsByIndex[data.index] = data;
            });

            // listen for new messages
            // this.messages = [];
            this.connection.events.onMessagePacket.subscribe((data) => {
                console.log("onMessagePacket", data);
                this.messages.push(data);
            });

            // listen for device status changes
            this.connection.events.onDeviceStatus.subscribe((data) => {

                // check if device is now disconnected
                if(data === Types.DeviceStatusEnum.DeviceDisconnected){
                    this.disconnect();
                }

            });

            // connect to device
            await this.connection.connect({
                filters: [
                    {
                        services: [
                            Constants.ServiceUuid,
                        ],
                    },
                ],
            });

            // mark as connected
            // todo should use onDeviceStatus instead, and show if still connecting...
            this.isConnected = true;

        },
        async disconnect() {

            // do nothing if already disconnected
            if(!this.isConnected){
                return;
            }

            // disconnect and clear ui data
            this.connection.disconnect();
            this.isConnected = false;

        },
        onPacketAck(requestId, ackedByNodeId) {

            console.log(`got ack for request id ${requestId} from ${ackedByNodeId}`);

            // find message by request id
            const message = this.messages.find((m) => m.id === requestId);
            if(!message){
                return;
            }

            // update ack
            message.acked_by_id = ackedByNodeId;

        },
        onChannelClick(channel) {
            if(this.selectedChannelId !== channel.index){
                this.selectedChannelId = channel.index;
            } else {
                this.selectedChannelId = null;
            }
        },
        onNodeClick(node) {
            if(this.selectedNodeId !== node.num){
                this.selectedNodeId = node.num;
            } else {
                this.selectedNodeId = null;
            }
        },
        async sendMessage() {

            // can't send if not connected
            if(!this.isConnected){
                alert("Not connected to device");
                return false;
            }

            // do nothing if message is empty
            const newMessageText = this.newMessageText;
            if(newMessageText == null || newMessageText === ""){
                return;
            }

            // clear new message input
            this.newMessageText = "";

            // send message to broadcast channel
            // todo: allow selecting channel
            // todo: send message as dm

            if(this.tab === "channels"){
                // send as broadcast to selected channel
                await this.connection.sendText(newMessageText, 0xFFFFFFFF, true, this.selectedChannelId);
            } else if(this.tab === "nodes") {
                // send as dm
                await this.connection.sendText(newMessageText, this.selectedNodeId, true);
            }

        },
        isMessageInbound(message) {
            // inbound messages are not from us
            return message.from !== this.myNodeId;
        },
        isMessageOutbound(message) {
            // outbound messages are from us
            return message.from === this.myNodeId;
        },
        isMessageAcknowledged(message) {
            // implicit acks for broadcast messages are always acked from our own id
            return message.acked_by_id === this.myNodeId;
        },
        isMessageDelivered(message) {
            // message is delivered if it was a direct message and was acked by the recipient
            return message.type === "direct" && message.acked_by_id === message.to;
        },
        isMessageFailed(message) {
            // todo implement
            return false;
        },
        formatTimeAgo(date) {
            return moment(date).fromNow();
        },
        getNodeShortName(nodeId) {
            return this.nodesById[nodeId]?.user?.shortName?.substring(0, 4) ?? "?";
        },
        getNodeLongName(nodeId) {
            return this.nodesById[nodeId]?.user?.longName ?? NodeUtils.getNodeHexId(nodeId);
        },
        scrollToBottom: function() {
            this.$nextTick(() => {
                var container = this.$el.querySelector("#messages");
                container.scrollTop = container.scrollHeight;
            });
        },
    },
    computed: {
        Protobuf() {
            return Protobuf;
        },
        NodeUtils() {
            return NodeUtils;
        },
        canSendMessage() {

            // can't send if channel is not selected
            if(this.tab === 'channel' && this.selectedChannelId == null){
                return false;
            }

            // can't send if node is not selected
            if(this.tab === 'nodes' && this.selectedNodeId == null){
                return false;
            }

            // can't send if empty message
            const messageText = this.newMessageText.trim();
            if(messageText == null || messageText === ""){
                return false;
            }

            // can't send if already sending
            if(this.isSendingMessage){
                return false;
            }

            return true;

        },
        messagesForSelectedNodeId() {
            // ensure a copy of the array is returned in reverse order
            return this.messages.filter((message) => {

                // get messages for channel
                if(this.tab === 'channels'){
                    const isToSelectedChannel = message.to === 0xFFFFFFFF && message.channel === this.selectedChannelId;
                    return isToSelectedChannel;
                }

                // get messages for node
                if(this.tab === 'nodes'){
                    const isFromMeToSelectedNode = message.from === this.myNodeId && message.to === this.selectedNodeId;
                    const isFromSelectedNodeToMe = message.from === this.selectedNodeId && message.to === this.myNodeId;
                    return isFromMeToSelectedNode || isFromSelectedNodeToMe;
                }

                return false;

            });
        },
        messagesReversed() {
            // ensure a copy of the array is returned in reverse order
            return this.messagesForSelectedNodeId.map((message) => message).reverse();
        },
    },
}
</script>
