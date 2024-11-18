<template>
    <Page>

        <!-- app bar -->
        <AppBar title="Trace Routes" :subtitle="subtitle">
            <template v-slot:leading>
                <NodeIcon v-if="node" :node="node" class="mr-3"/>
            </template>
            <template v-slot:trailing>
                <RouterLink v-if="node" :to="{ name: 'node.traceroutes.run', params: { nodeId: node.num }}">
                    <IconButton  class="mx-2 bg-transparent text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                    </IconButton>
                </RouterLink>
            </template>
        </AppBar>

        <!-- list -->
        <div class="flex h-full w-full overflow-hidden">
            <div class="w-full overflow-y-auto">
                <div v-for="traceRoute of traceRoutes">
                    <RouterLink :to="{ name: 'traceroute', params: { traceRouteId: traceRoute.id} }">
                        <div class="flex p-2 bg-white hover:bg-gray-50">
                            <div>
                                <div class="text-sm text-gray-900">
                                    <span class="font-medium">{{ getNodeLongName(traceRoute.to) || '???' }}</span>
                                    <span> to </span>
                                    <span class="font-medium">{{ getNodeLongName(traceRoute.from) || '???' }}</span>
                                </div>
                                <div class="text-sm text-gray-700">
                                    {{ getTimeAgo(new Date(traceRoute.timestamp)) }} • {{ traceRoute.data.route.length }} hop(s) on channel {{ getChannelName(traceRoute.channel) }}
                                </div>
                            </div>
                        </div>
                    </RouterLink>
                </div>
            </div>
        </div>

    </Page>
</template>

<script>
import GlobalState from "../../js/GlobalState.js";
import AppBar from "../AppBar.vue";
import NodeIcon from "../nodes/NodeIcon.vue";
import Page from "./Page.vue";
import NodeUtils from "../../js/NodeUtils.js";
import IconButton from "../IconButton.vue";
import ChannelUtils from "../../js/ChannelUtils.js";
import TimeUtils from "../../js/TimeUtils.js";
import Database from "../../js/Database.js";

export default {
    name: 'NodeTracesRoutePage',
    components: {
        Page,
        AppBar,
        IconButton,
        NodeIcon,
    },
    props: {
        nodeId: String | Number,
    },
    data() {
        return {
            traceRoutes: [],
            traceRoutesSubscription: null,
        };
    },
    mounted() {

        // init database subscription for trace routes
        this.traceRoutesSubscription = Database.TraceRoute.getTraceRoutesByNodeId(this.nodeId).$.subscribe((traceRoutes) => {
            this.traceRoutes = traceRoutes.map((traceRoute) => traceRoute.toJSON()).reverse();
        });

    },
    unmounted() {
        this.traceRoutesSubscription?.unsubscribe();
    },
    methods: {
        getNodeLongName: (nodeId) => NodeUtils.getNodeLongName(nodeId),
        getTimeAgo: (date) => TimeUtils.getTimeAgo(date),
        getChannelName: (channelId) => {
            return ChannelUtils.getChannelName(channelId) || `#${channelId}`;
        },
    },
    computed: {
        node() {
            return GlobalState.nodesById[this.nodeId];
        },
        subtitle() {
            return this.node ? this.getNodeLongName(this.node.num) : "Unknown Node";
        },
    },
}
</script>
