<template>
    <Page>

        <!-- app bar -->
        <AppBar title="Channel Messages" :subtitle="subtitle">
            <template v-slot:trailing>
                <ChannelPskBadge v-if="channel" :channel="channel" class="mr-2"/>
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

export default {
    name: 'ChannelMessagesPage',
    components: {
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
    computed: {
        channel() {
            return GlobalState.channelsByIndex[this.channelId];
        },
        subtitle() {
            return this.channel?.settings?.name || '(No Name)';
        },
    },
}
</script>
