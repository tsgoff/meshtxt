<template>
    <Page>

        <!-- app bar -->
        <AppBar title="Channel Messages" :subtitle="subtitle">
            <template v-slot:trailing>
                <ChannelPskBadge v-if="channel" :channel="channel" class="my-auto mr-2"/>
                <IconButton v-if="channel" @click="deleteMessageHistory" class="my-auto bg-transparent text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                </IconButton>
            </template>
        </AppBar>

        <!-- list -->
        <div class="flex h-full w-full overflow-hidden">
            <MessageViewer v-if="channel != null" type="channel" :channel-id="channel.index"/>
        </div>

    </Page>
</template>

<script>
import GlobalState from "../../js/GlobalState.js";
import AppBar from "../AppBar.vue";
import MessageViewer from "../messages/MessageViewer.vue";
import Page from "./Page.vue";
import ChannelPskBadge from "../channels/ChannelPskBadge.vue";
import IconButton from "../IconButton.vue";
import Database from "../../js/Database.js";
import ChannelUtils from "../../js/ChannelUtils.js";

export default {
    name: 'ChannelMessagesPage',
    components: {
        IconButton,
        ChannelPskBadge,
        Page,
        AppBar,
        MessageViewer,
    },
    props: {
        channelId: String | Number,
    },
    mounted() {

        // redirect to main page if channel not found
        if(!this.channel){
            this.$router.push({
                name: "main",
            });
            return;
        }

    },
    methods: {
        getChannelName: (channelId) => ChannelUtils.getChannelName(channelId),
        async deleteMessageHistory() {

            // confirm user wants to delete message history
            if(!confirm("Are you sure you want to delete all message history for this channel?")){
                return;
            }

            // delete message history
            await Database.Message.deleteChannelMessages(this.channelId);

        },
    },
    computed: {
        channel() {
            return GlobalState.channelsByIndex[this.channelId];
        },
        subtitle() {
            if(this.channel){
                return this.getChannelName(this.channel.index);
            }
            return "Unknown Channel";
        },
    },
}
</script>
