<template>
    <Page>

        <!-- header -->
        <Header/>

        <!-- tabs -->
        <div v-if="channels.length > 0 || nodes.length > 0" class="bg-white border-b border-r border-gray-200">
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
            <div class="flex flex-col mx-auto my-auto p-4 text-gray-500 text-center">

                <!-- icon -->
                <div class="mb-2 mx-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" class="w-10">
                        <rect width="256" height="256" fill="none"/>
                        <circle cx="136" cy="64" r="24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
                        <line x1="8" y1="128" x2="200" y2="128" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
                        <polygon points="200 96 200 160 248 128 200 96" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
                        <rect x="112" y="168" width="48" height="48" rx="8" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
                        <path d="M112,64H72a8,8,0,0,0-8,8V184a8,8,0,0,0,8,8h40" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
                    </svg>
                </div>

                <!-- info -->
                <div class="font-semibold">Not Connected</div>
                <div class="mb-2">Connect to a Meshtastic device!</div>

            </div>
        </div>

    </Page>
</template>

<script>
import GlobalState from "../../js/GlobalState.js";
import Header from "../Header.vue";
import ChannelsList from "../channels/ChannelsList.vue";
import NodesList from "../nodes/NodesList.vue";
import Page from "./Page.vue";

export default {
    name: 'MainPage',
    components: {
        Page,
        Header,
        NodesList,
        ChannelsList
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
