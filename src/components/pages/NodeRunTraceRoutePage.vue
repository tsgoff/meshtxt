<template>
    <Page>

        <!-- app bar -->
        <AppBar title="Trace Route" :subtitle="subtitle">
            <template v-slot:leading>
                <NodeIcon v-if="node" :node="node" class="mr-3"/>
            </template>
        </AppBar>

        <!-- list -->
        <div v-if="node" class="mx-auto my-auto">

            <!-- run trace route -->
            <div v-if="!isRunningTraceRoute" class="space-y-2">

                <!-- info -->
                <div class="flex flex-col mx-auto my-auto text-gray-700 text-center">
                    <div class="mb-2 mx-auto">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" class="size-10">
                            <path d="M235.81,75.79A27.91,27.91,0,0,1,216,84a28.49,28.49,0,0,1-5.67-.58l-30.57,56.77,0,0a28,28,0,1,1-44.43,6.49l-26.06-26.06A28.07,28.07,0,0,1,96,124a28.41,28.41,0,0,1-5.67-.58L59.76,180.18l0,0a28,28,0,1,1-39.6,0h0a28,28,0,0,1,25.47-7.61l30.57-56.77,0,0a28.05,28.05,0,0,1,0-39.61h0a28,28,0,0,1,44.43,33.12l26.06,26.06a28.1,28.1,0,0,1,19-2.77l30.57-56.77,0,0a28,28,0,0,1,0-39.6h0a28,28,0,0,1,39.6,39.6Z"></path>
                        </svg>
                    </div>
                    <div class="font-semibold">Run a Trace Route</div>
                    <div>Trace Routes may take a while to complete.</div>
                </div>

                <!-- run trace route button -->
                <div class="w-full">
                    <button @click="runTraceRoute(node)" type="button" class="mx-auto flex cursor-pointer bg-white rounded shadow px-3 py-2 text-black font-semibold hover:bg-gray-100">
                        Run Now
                    </button>
                </div>

            </div>

            <!-- running trace route -->
            <div v-else class="space-y-2">

                <!-- info -->
                <div class="flex flex-col mx-auto my-auto text-gray-700 text-center">
                    <div class="mb-2 mx-auto">
                        <svg class="animate-spin size-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                    <div class="font-semibold">Running Trace Route</div>
                    <div>If it does not complete, try again later.</div>
                </div>

                <!-- ignore result button -->
                <div class="w-full">
                    <button @click="onIgnoreResultClick" type="button" class="mx-auto flex cursor-pointer bg-white rounded shadow px-3 py-2 text-black font-semibold hover:bg-gray-100">
                        Ignore Result
                    </button>
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
import NodeAPI from "../../js/NodeAPI.js";
import Connection from "../../js/Connection.js";
import Database from "../../js/Database.js";

export default {
    name: 'NodeTracesRoutePage',
    components: {
        Page,
        AppBar,
        NodeIcon,
    },
    props: {
        nodeId: String | Number,
    },
    data() {
        return {
            isRunningTraceRoute: false,
        };
    },
    mounted() {

        // listen for trace routes
        Connection.addTraceRouteListener(this.onTraceRoutePacket);
        Connection.addClientNotificationListener(this.onClientNotification);

        // redirect to main page if node not found
        if(!this.node){
            this.$router.push({
                name: "main",
            });
            return;
        }

    },
    beforeUnmount() {

        // stop listening for trace routes
        Connection.removeTraceRouteListener(this.onTraceRoutePacket);
        Connection.removeClientNotificationListener(this.onClientNotification);

    },
    beforeRouteLeave(to, from) {
        // ignore previous trace route when coming back
        this.isRunningTraceRoute = false;
    },
    methods: {
        getNodeLongName: (nodeId) => NodeUtils.getNodeLongName(nodeId),
        async runTraceRoute(node) {

            // do nothing if already running
            if(this.isRunningTraceRoute){
                return;
            }

            // mark as running
            this.isRunningTraceRoute = true;

            // run trace route
            try {
                await NodeAPI.traceRoute(node.num);
            } catch(e) {
                // don't care about timeout
            }

        },
        onIgnoreResultClick() {
            this.isRunningTraceRoute = false;
        },
        onTraceRoutePacket(data) {
            if(data.to === GlobalState.myNodeId && data.from === this.node.num){
                if(this.isRunningTraceRoute){
                    this.onTraceRouteComplete(data);
                }
            }
        },
        async onTraceRouteComplete(traceRoute) {

            // no longer running trace route
            this.isRunningTraceRoute = false;

            // find latest trace route by packet id
            const databaseTraceRoute = await Database.TraceRoute.findTraceRouteByPacketId(traceRoute.id).exec();
            if(!databaseTraceRoute){
                return;
            }

            // pop this route off the stack
            // we don't want the user to have to navigate out of the run page after leaving trace route result
            this.$router.back();

            // go to trace route page
            this.$router.push({
                name: "traceroute",
                params: {
                    traceRouteId: databaseTraceRoute.id,
                },
            });

        },
        onClientNotification(clientNotification) {

            // check if meshtastic device rate limited trace route
            if(clientNotification.message === "TraceRoute can only be sent once every 30 seconds"){
                this.isRunningTraceRoute = false;
            }

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
