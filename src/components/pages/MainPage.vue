<template>
    <Page>

        <!-- header -->
        <Header/>

        <!-- tabs -->
        <div v-if="channels.length > 0 || nodes.length > 0" class="bg-white border-b border-gray-200">
            <div class="-mb-px flex">
                <div @click="tab = 'channels'" class="w-full border-b-2 py-3 px-1 text-center text-sm font-medium cursor-pointer" :class="[ tab === 'channels' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700']">Channels</div>
                <div @click="tab = 'nodes'" class="w-full border-b-2 py-3 px-1 text-center text-sm font-medium cursor-pointer" :class="[ tab === 'nodes' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700']">Nodes</div>
            </div>
        </div>

        <!-- tab content -->
        <div v-if="channels.length > 0 || nodes.length > 0" class="flex h-full w-full overflow-hidden">
            <ChannelsList v-if="tab === 'channels'" :channels="channels" @channel-click="onChannelClick"/>
            <NodesList v-if="tab === 'nodes'" :nodes="nodes" @node-click="onNodeClick"/>
        </div>

        <!-- not connected and no content -->
        <div v-if="!isConnected && channels.length === 0 && nodes.length === 0" class="mx-auto my-auto">
            <ConnectButtons/>
        </div>

    </Page>
</template>

<script>
import GlobalState from "../../js/GlobalState.js";
import Header from "../Header.vue";
import ChannelsList from "../channels/ChannelsList.vue";
import NodesList from "../nodes/NodesList.vue";
import Page from "./Page.vue";
import ConnectButtons from "../connect/ConnectButtons.vue";

export default {
    name: 'MainPage',
    components: {
        ConnectButtons,
        Page,
        Header,
        NodesList,
        ChannelsList,
    },
    data() {
        return {
            tab: 'channels',
        };
    },
    methods: {
        onChannelClick(channel) {
            this.$router.push({
                name: "channel.messages",
                params: {
                    channelId: channel.index,
                },
            });
        },
        onNodeClick(node) {
            this.$router.push({
                name: "node.messages",
                params: {
                    nodeId: node.num,
                },
            });
        },
    },
    computed: {
        GlobalState() {
            return GlobalState;
        },
        isConnected() {
            return GlobalState.isConnected;
        },
        channels() {
            return Object.values(GlobalState.channelsByIndex);
        },
        nodes() {
            return Object.values(GlobalState.nodesById);
        },
    },
}
</script>
