<template>
    <div class="flex flex-col w-full h-full">

        <!-- messages -->
        <div @scroll="onMessagesScroll" id="messages" class="h-full overflow-y-auto bg-gray-50">

            <div v-if="messagesReversed.length > 0" class="flex flex-col-reverse p-3">

                <div v-for="message of messagesReversed" :key="message.id" class="flex max-w-xl mt-3" :class="{ 'ml-auto pl-4 md:pl-16': isMessageOutbound(message), 'mr-auto pr-4 md:pr-16': isMessageInbound(message) }">

                    <!-- inbound sender -->
                    <div v-if="isMessageInbound(message)" class="mr-2 mt-2">
                        <RouterLink :to="{ name: 'node', params: { nodeId: message.from }}">
                            <NodeIcon :node-id="message.from"/>
                        </RouterLink>
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
                                    <span v-if="isMessageFailed(message)">Failed: {{ Protobuf.Mesh.Routing_Error[message.error] ?? message.error }}</span>
                                    <span v-else-if="isMessageDelivered(message)">Delivered</span>
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
import {Protobuf} from "@meshtastic/js";
import GlobalState from "../../js/GlobalState.js";
import NodeAPI from "../../js/NodeAPI.js";
import MessageUtils from "../../js/MessageUtils.js";
import NodeUtils from "../../js/NodeUtils.js";
import DeviceUtils from "../../js/DeviceUtils.js";
import Database from "../../js/Database.js";
import NodeIcon from "../nodes/NodeIcon.vue";

export default {
    name: 'MessageViewer',
    components: {NodeIcon},
    props: {
        type: String,
        channelId: Number,
        nodeId: Number,
    },
    data() {
        return {

            isActive: false,
            messages: [],
            messagesSubscription: null,

            newMessageText: "",
            isSendingMessage: false,
            autoScrollOnNewMessage: true,

        };
    },
    mounted() {

        // init database subscription for messages
        if(this.type === "channel"){
            this.messagesSubscription = Database.Message.getChannelMessages(this.channelId).$.subscribe(this.onMessagesUpdated);
        } else if(this.type === "node") {
            this.messagesSubscription = Database.Message.getNodeMessages(this.nodeId).$.subscribe(this.onMessagesUpdated);
        }

    },
    unmounted() {
        this.messagesSubscription?.unsubscribe();
    },
    activated() {

        this.isActive = true;

        // update read state when coming back to message viewer
        this.updateMessagesLastReadAt();

    },
    deactivated() {
        this.isActive = false;
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

            // don't allow sending messages longer than 200 characters
            // I was able to send 245 characters to the radio without any error, but the sending times out
            // to prevent the user from having to wait for this timeout, just hard limit to 200 for a faster response
            const maxMessageLength = 200;
            const messageLength = newMessageText.length;
            if(messageLength > maxMessageLength){
                alert(`Your message is too long. Please shorten it and try again. ${messageLength}/${maxMessageLength}.`)
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

                // handle error thrown when message too long
                // unfortunately @meshtastic/js does not provide the packet id in this case...
                // this means we have to attempt to find the message that was already added to the ui without using the packet id
                if(e instanceof Error){

                    // set error message on latest message from us with provided text
                    await Database.Message.setMessageErrorByLatestMessageText(newMessageText, e.message);
                    return;

                }

                // message failed to send update internal error state
                await Database.Message.setMessageErrorByPacketId(e.id, e.error);

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
        onMessagesUpdated(messages) {

            // update messages in ui
            this.messages = messages.map((message) => message.toJSON());

            // check if we should auto scroll on new message
            if(this.autoScrollOnNewMessage){

                // auto scroll to bottom if we want to
                this.scrollMessagesToBottom();

                // update read state since we auto scrolled to bottom of new messages
                this.updateMessagesLastReadAt();

            }

        },
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

            // update read state since we scrolled to bottom
            if(isAtBottom){
                this.updateMessagesLastReadAt();
            }

        },
        scrollMessagesToBottom: function() {
            this.$nextTick(() => {
                var container = this.$el.querySelector("#messages");
                container.scrollTop = container.scrollHeight;
            });
        },
        updateMessagesLastReadAt() {

            // do nothing if route is not active
            if(!this.isActive){
                return;
            }

            // check what type of messages we are viewing
            if(this.type === "node"){
                // update last read at for node messages
                Database.NodeMessagesReadState.touch(this.nodeId);
            } else if(this.type === "channel") {
                // update last read at for channel messages
                Database.ChannelMessagesReadState.touch(this.channelId);
            }

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
        messagesReversed() {
            // ensure a copy of the array is returned in reverse order
            return this.messages.map((message) => message).reverse();
        },
    },
}
</script>
