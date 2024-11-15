<template>
    <Page>

        <!-- app bar -->
        <AppBar :title="title" subtitle="Channel Messages"/>

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

export default {
    name: 'ChannelMessagesPage',
    components: {
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
        title() {
            return this.channel?.settings?.name || 'Unnamed Channel';
        },
    },
}
</script>
