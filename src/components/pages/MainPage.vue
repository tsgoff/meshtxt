<template>
    <div class="flex flex-col h-full max-w-3xl mx-auto border-x bg-gray-300">

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
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-10">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 0 1 1.06 0Z" />
                    </svg>
                </div>

                <!-- info -->
                <div class="font-semibold">Not Connected</div>
                <div class="mb-2">Connect to a Meshtastic device!</div>

                <!-- connect button -->
                <RouterLink :to="{ name: 'connect' }">
                    <div class="bg-blue-500 text-white px-2 py-1 p-1 rounded shadow hover:bg-blue-400 font-semibold">
                        Connect
                    </div>
                </RouterLink>

            </div>
        </div>

    </div>
</template>

<script>
import GlobalState from "../../js/GlobalState.js";
import Header from "../Header.vue";
import ChannelsList from "../channels/ChannelsList.vue";
import NodesList from "../nodes/NodesList.vue";

export default {
    name: 'MainPage',
    components: {
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
