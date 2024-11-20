<template>
    <div class="flex cursor-pointer p-2 bg-white hover:bg-gray-50">

        <!-- channel info -->
        <div class="my-auto mr-auto">
            <div>{{ getChannelName(channel.index) }}</div>
            <div class="text-sm text-gray-500">
                <span v-if="channel.role === Protobuf.Channel.Channel_Role.PRIMARY">Primary Channel</span>
                <span v-else-if="channel.role === Protobuf.Channel.Channel_Role.SECONDARY">Secondary Channel</span>
                <span v-else-if="channel.role === Protobuf.Channel.Channel_Role.DISABLED">Disabled Channel</span>
                <span v-else>Unknown Channel Role</span>
            </div>
        </div>

        <!-- unread messages count -->
        <div v-if="unreadMessagesCount > 0" class="my-auto mr-2">
            <div class="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 rounded-full shadow">
                <span v-if="unreadMessagesCount >= 100">99</span>
                <span>{{ unreadMessagesCount }}</span>
            </div>
        </div>

    </div>
</template>

<script>
import Database from "../../js/Database.js";
import Connection from "../../js/Connection.js";
import ChannelUtils from "../../js/ChannelUtils.js";
import {
    Protobuf,
} from "@meshtastic/js";

export default {
    name: 'ChannelListItem',
    props: {
        channel: Object,
    },
    data() {
        return {
            unreadMessagesCount: 0,
            channelMessagesReadStateSubscription: null,
        };
    },
    mounted() {
        Connection.addMessageListener(this.onMessage);
        this.channelMessagesReadStateSubscription = Database.ChannelMessagesReadState.get(this.channel.index).$.subscribe(async (channelMessagesReadState) => {
            await this.onChannelMessagesReadStateChange(channelMessagesReadState);
        });
    },
    unmounted() {
        Connection.removeMessageListener(this.onMessage);
        this.channelMessagesReadStateSubscription?.unsubscribe();
    },
    methods: {
        getChannelName: (channelId) => ChannelUtils.getChannelName(channelId),
        async onMessage() {
            const channelMessagesReadState = await Database.ChannelMessagesReadState.get(this.channel.index).exec();
            await this.onChannelMessagesReadStateChange(channelMessagesReadState);
        },
        async updateUnreadMessagesCount(lastReadTimestamp) {
            this.unreadMessagesCount = await Database.Message.getChannelMessagesUnreadCount(this.channel.index, lastReadTimestamp).exec();
        },
        async onChannelMessagesReadStateChange(channelMessagesReadState) {
            const messagesLastReadTimestamp = channelMessagesReadState?.timestamp ?? 0;
            await this.updateUnreadMessagesCount(messagesLastReadTimestamp);
        },
    },
    computed: {
        Protobuf() {
            return Protobuf;
        },
    },
}
</script>
