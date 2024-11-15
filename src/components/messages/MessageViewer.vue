<template>
    <div class="flex flex-col w-full h-full">

        <!-- messages -->
        <div @scroll="onMessagesScroll" id="messages" class="h-full overflow-y-auto bg-gray-50">

            <div v-if="messagesReversed.length > 0" class="flex flex-col-reverse p-3">

                <div v-for="message of messagesReversed" :key="message.id" class="flex max-w-xl mt-3" :class="{ 'ml-auto pl-4 md:pl-16': isMessageOutbound(message), 'mr-auto pr-4 md:pr-16': isMessageInbound(message) }">

                    <!-- inbound sender -->
                    <div v-if="isMessageInbound(message)" class="mr-2 mt-2">
                        <div class="flex rounded-full h-12 w-12 text-white shadow" :style="{ backgroundColor: getNodeColour(message.from), color: getNodeTextColour(message.from)}">
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
                                    <span v-else-if="isMessageFailed(message)">
                                        <span>Failed: {{ Protobuf.Mesh.Routing_Error[message.error] ?? message.error }}</span>
                                    </span>
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
                @keydown.enter.exact.native="onEnterPressed"
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
</template>

<script>
import {Constants, Protobuf} from "@meshtastic/js";
import GlobalState from "../../js/GlobalState.js";
import NodeAPI from "../../js/NodeAPI.js";
import MessageUtils from "../../js/MessageUtils.js";
import NodeUtils from "../../js/NodeUtils.js";
import DeviceUtils from "../../js/DeviceUtils.js";
import Connection from "../../js/Connection.js";

export default {
    name: 'MessageViewer',
    props: {
        type: String,
        channelId: Number,
        nodeId: Number,
    },
    data() {
        return {
            newMessageText: "",
            isSendingMessage: false,
            autoScrollOnNewMessage: true,
        };
    },
    methods: {
        async sendMessage() {

            // can't send if not connected
            if(!GlobalState.isConnected){
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

            // send message based on current tab
            try {
                if(this.type === "channel"){
                    await NodeAPI.sendBroadcastMessageToChannel(this.channelId, newMessageText);
                } else if(this.type === "node") {
                    await NodeAPI.sendDirectMessageToNode(this.nodeId, newMessageText);
                }
            } catch(e) {

                console.log(e);

                // handle error thrown when message to long
                // unfortunately @meshtastic/js does not provide the packet id in this case...
                // fixme: this means we can't show an error state for the message that was already added to the ui
                if(e instanceof Error){
                    alert(e.message);
                    return;
                }

                // message failed to send update internal error state
                Connection.onPacketError(e.id, e.error);

            }

        },
        isMessageInbound: (message) => MessageUtils.isMessageInbound(message),
        isMessageOutbound: (message) => MessageUtils.isMessageOutbound(message),
        isMessageAcknowledged: (message) => MessageUtils.isMessageAcknowledged(message),
        isMessageDelivered: (message) => MessageUtils.isMessageDelivered(message),
        isMessageFailed: (message) => MessageUtils.isMessageFailed(message),
        getNodeColour: (nodeId) => NodeUtils.getNodeColour(nodeId),
        getNodeTextColour: (nodeId) => NodeUtils.getNodeTextColour(nodeId),
        getNodeShortName: (nodeId) => NodeUtils.getNodeShortName(nodeId),
        getNodeLongName: (nodeId) => NodeUtils.getNodeLongName(nodeId),
        onEnterPressed: function(event) {

            // send message if not on mobile
            if(!DeviceUtils.isMobile()){
                event.preventDefault();
                this.sendMessage();
                return;
            }

        },
        onMessagesScroll(event) {

            // check if messages is scrolled to bottom
            const element = event.target;
            const isAtBottom = element.scrollTop === (element.scrollHeight - element.offsetHeight);

            // we want to auto scroll if user is at bottom of messages list
            this.autoScrollOnNewMessage = isAtBottom;

        },
        scrollMessagesToBottom: function() {
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
        canSendMessage() {

            // can't send if channel is not selected
            if(this.type === 'channel' && this.channelId == null){
                return false;
            }

            // can't send if node is not selected
            if(this.type === 'node' && this.nodeId == null){
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
        messages() {
            return GlobalState.messages.filter((message) => {

                // get messages for channel
                if(this.type === 'channel'){
                    return message.to === Constants.broadcastNum && message.channel === this.channelId;
                }

                // get messages for node
                if(this.type === 'node'){
                    const isFromMeToSelectedNode = message.from === GlobalState.myNodeId && message.to === this.nodeId;
                    const isFromSelectedNodeToMe = message.from === this.nodeId && message.to === GlobalState.myNodeId;
                    return isFromMeToSelectedNode || isFromSelectedNodeToMe;
                }

                // we don't want to show this message
                return false;

            });
        },
        messagesReversed() {
            // ensure a copy of the array is returned in reverse order
            return this.messages.map((message) => message).reverse();
        },
    },
    watch: {
        messages: {
            handler: function(newMessages, oldMessages) {

                // determine if new messages have been added
                const hasNewMessages = newMessages.length > oldMessages.length;

                // auto scroll to bottom if we want to
                if(hasNewMessages && this.autoScrollOnNewMessage){
                    this.scrollMessagesToBottom();
                }

            },
        },
    },
}
</script>
