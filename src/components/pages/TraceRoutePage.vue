<template>
    <Page>

        <!-- app bar -->
        <AppBar title="TraceRoute" :subtitle="subtitle"/>

        <!-- list -->
        <div v-if="traceRoute" class="flex flex-col h-full w-full overflow-hidden">
            <div class="overflow-y-auto">

                <div class="bg-gray-200 p-2">
                    <div class="font-semibold">Route</div>
                    <div class="text-sm text-gray-500">
                        <span>{{ traceRoute.data.route.length }} {{ traceRoute.data.route.length === 1 ? 'hop' : 'hops' }} there</span>
                        <span> • </span>
                        <span>{{ traceRoute.data.routeBack.length }} {{ traceRoute.data.routeBack.length === 1 ? 'hop' : 'hops' }} back</span>
                    </div>
                </div>

                <!-- route towards -->
                <div class="p-2 bg-white">
                    <ul role="list" class="space-y-3">

                        <!-- node that initiated traceroute -->
                        <li class="relative flex gap-x-4">
                            <div class="absolute left-0 top-3 flex w-12 justify-center -bottom-3">
                                <div class="w-px bg-gray-200"></div>
                            </div>
                            <div class="my-auto relative flex flex-none items-center justify-center">
                                <div>
                                    <NodeIcon :node-id="traceRoute.to"/>
                                </div>
                            </div>
                            <div class="flex-auto py-0.5 text-sm leading-5 text-gray-500">
                                <div class="font-medium text-gray-900">{{ getNodeLongName(traceRoute.to) || '???' }}</div>
                                <div>{{ getNodeHexId(traceRoute.to) }}</div>
                                <div>Started the traceroute</div>
                            </div>
                            <div v-if="traceRoute.data.snrTowards.length > 0 && traceRoute.data.snrTowards[0] != null && traceRoute.data.snrTowards[0] !== -128" class="my-auto mr-1 text-sm text-gray-500">
                                {{ traceRoute.data.snrTowards[0] / 4 }}dB SNR
                            </div>
                            <div class="my-auto">
                                <NodeDropDownMenu :node="findNodeById(traceRoute.to)"/>
                            </div>
                        </li>

                        <!-- route toward nodes -->
                        <li v-for="(route, index) of traceRoute.data.route" class="relative flex gap-x-4">
                            <div class="absolute left-0 top-0 flex w-12 justify-center -bottom-3">
                                <div class="w-px bg-gray-200"></div>
                            </div>
                            <div class="my-auto relative flex flex-none items-center justify-center">
                                <div>
                                    <NodeIcon :node-id="route"/>
                                </div>
                            </div>
                            <div class="flex-auto py-0.5 text-sm leading-5 text-gray-500">
                                <div class="font-medium text-gray-900">{{ getNodeLongName(route) || '???' }}</div>
                                <div>{{ getNodeHexId(route) }}</div>
                                <div>Forwarded the packet</div>
                            </div>
                            <div v-if="traceRoute.data.snrTowards.length > 0 && traceRoute.data.snrTowards[index + 1] != null && traceRoute.data.snrTowards[index + 1] !== -128" class="my-auto mr-1 text-sm text-gray-500">
                                {{ traceRoute.data.snrTowards[index + 1] / 4 }}dB SNR
                            </div>
                            <div class="my-auto">
                                <NodeDropDownMenu :node="findNodeById(route)"/>
                            </div>
                        </li>

                        <!-- node that replied to traceroute -->
                        <li v-if="traceRoute.from" class="relative flex gap-x-4">
                            <div class="absolute left-0 top-0 flex w-12 justify-center -bottom-3">
                                <div class="w-px bg-gray-200"></div>
                            </div>
                            <div class="my-auto relative flex flex-none items-center justify-center">
                                <div>
                                    <NodeIcon :node-id="traceRoute.from"/>
                                </div>
                            </div>
                            <div class="flex-auto py-0.5 text-sm leading-5 text-gray-500">
                                <div class="font-medium text-gray-900">{{ getNodeLongName(traceRoute.from) || '???' }}</div>
                                <div>{{ getNodeHexId(traceRoute.from) }}</div>
                                <div>Replied to traceroute</div>
                            </div>
                            <div v-if="traceRoute.data.snrBack.length > 0 && traceRoute.data.snrBack[0] != null && traceRoute.data.snrBack[0] !== -128" class="my-auto mr-1 text-sm text-gray-500">
                                {{ traceRoute.data.snrBack[0] / 4 }}dB SNR
                            </div>
                            <div class="my-auto">
                                <NodeDropDownMenu :node="findNodeById(traceRoute.from)"/>
                            </div>
                        </li>

                        <!-- route back nodes -->
                        <li v-for="(route, index) of traceRoute.data.routeBack" class="relative flex gap-x-4">
                            <div class="absolute left-0 top-0 flex w-12 justify-center -bottom-3">
                                <div class="w-px bg-gray-200"></div>
                            </div>
                            <div class="my-auto relative flex flex-none items-center justify-center">
                                <div>
                                    <NodeIcon :node-id="route"/>
                                </div>
                            </div>
                            <div class="flex-auto py-0.5 text-sm leading-5 text-gray-500">
                                <div v-if="route === 0xFFFFFFFF">
                                    <div class="font-medium text-gray-900">Unknown Node</div>
                                </div>
                                <div v-else>
                                    <div class="font-medium text-gray-900">{{ getNodeLongName(route) || '???' }}</div>
                                    <div>{{ getNodeHexId(route) }}</div>
                                </div>
                                <div>Forwarded the packet</div>
                            </div>
                            <div v-if="traceRoute.data.snrBack.length > 0 && traceRoute.data.snrBack[index + 1] != null && traceRoute.data.snrBack[index + 1] !== -128" class="my-auto mr-1 text-sm text-gray-500">
                                {{ traceRoute.data.snrBack[index + 1] / 4 }}dB SNR
                            </div>
                            <div class="my-auto">
                                <NodeDropDownMenu :node="findNodeById(route)"/>
                            </div>
                        </li>

                        <!-- node that initiated traceroute -->
                        <li class="relative flex gap-x-4">
                            <div class="absolute left-0 top-0 flex w-12 justify-center h-6">
                                <div class="w-px bg-gray-200"></div>
                            </div>
                            <div class="my-auto relative flex flex-none items-center justify-center">
                                <div>
                                    <NodeIcon :node-id="traceRoute.to"/>
                                </div>
                            </div>
                            <div class="flex-auto py-0.5 text-sm leading-5 text-gray-500">
                                <div class="font-medium text-gray-900">{{ getNodeLongName(traceRoute.to) || '???' }}</div>
                                <div>{{ getNodeHexId(traceRoute.to) }}</div>
                                <div>Received traceroute response</div>
                            </div>
                            <div class="my-auto">
                                <NodeDropDownMenu :node="findNodeById(traceRoute.to)"/>
                            </div>
                        </li>

                    </ul>
                </div>

                <!-- raw data -->
                <div>
                    <div class="bg-gray-200 p-2 font-semibold">Raw Data</div>
                    <div class="text-sm text-gray-700">
                        <pre class="bg-white p-2 overflow-x-auto">{{ JSON.stringify(traceRoute, null, 4) }}</pre>
                    </div>
                </div>

            </div>
        </div>

    </Page>
</template>

<script>
import GlobalState from "../../js/GlobalState.js";
import AppBar from "../AppBar.vue";
import Page from "./Page.vue";
import NodeUtils from "../../js/NodeUtils.js";
import NodeIcon from "../nodes/NodeIcon.vue";
import moment from "moment";
import ChannelUtils from "../../js/ChannelUtils.js";
import TimeUtils from "../../js/TimeUtils.js";
import Database from "../../js/Database.js";
import NodeDropDownMenu from "../nodes/NodeDropDownMenu.vue";

export default {
    name: 'TraceRoutePage',
    components: {
        NodeDropDownMenu,
        NodeIcon,
        Page,
        AppBar,
    },
    props: {
        traceRouteId: String | Number,
    },
    data() {
        return {
            traceRoute: null,
            traceRouteSubscription: null,
        };
    },
    mounted() {

        // find trace route by id
        this.traceRouteSubscription = Database.TraceRoute.findTraceRouteById(this.traceRouteId).$.subscribe((traceRoute) => {
            this.traceRoute = traceRoute?.toJSON();
        });

    },
    beforeUnmount() {
        this.traceRouteSubscription?.unsubscribe();
    },
    methods: {
        getNodeHexId: (nodeId) => NodeUtils.getNodeHexId(nodeId),
        getNodeLongName: (nodeId) => NodeUtils.getNodeLongName(nodeId),
        findNodeById(nodeId){
            return GlobalState.nodesById[nodeId];
        },
        formatDateTime: (date) => TimeUtils.formatDateTime(date),
        getChannelName: (channelId) => {
            return ChannelUtils.getChannelName(channelId) || `channel #${channelId}`;
        },
    },
    computed: {
        subtitle() {
            if(this.traceRoute){
                return `${this.formatDateTime(this.traceRoute.rxTime)} • on ${this.getChannelName(this.traceRoute.channel)}`;
            } else {
                return `#${this.traceRouteId}`;
            }
        },
    },
}
</script>
