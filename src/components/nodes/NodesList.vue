<template>
    <div class="flex flex-col h-full w-full overflow-hidden">

        <!-- search -->
        <div v-if="nodes.length > 0" class="bg-white p-1 border-b border-gray-300">
            <input v-model="nodesSearchTerm" type="text" :placeholder="`Search ${nodes.length} Nodes...`" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
        </div>

        <!-- nodes -->
        <div class="h-full overflow-y-auto">
            <div :key="node.num" v-for="node of searchedNodes" @click="onNodeClick(node)" class="flex cursor-pointer p-2 border-l-2" :class="[ selectedNodeId === node.num ? 'bg-gray-100 border-blue-500' : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-200']">

                <!-- icon -->
                <NodeIcon :node="node" class="my-auto mr-2"/>

                <!-- name and info -->
                <div class="mr-auto">
                    <div>{{ getNodeLongName(node.num) }}</div>
                    <div class="text-sm text-gray-500">

                        <!-- our node info -->
                        <div v-if="node.num === GlobalState.myNodeId">
                            You are connected to this node
                        </div>

                        <!-- other node info -->
                        <div v-else>

                            <!-- hops away -->
                            <span v-if="node.hopsAway === -1">Unknown Hops</span>
                            <span v-else-if="node.hopsAway === 0">Direct Connection</span>
                            <span v-else-if="node.hopsAway === 1">1 Hop Away</span>
                            <span v-else>{{ node.hopsAway }} Hops Away</span>

                            <!-- last heard -->
                            <span v-if="node.lastHeard"> • heard {{ formatUnixSecondsAgo(node.lastHeard) }}</span>

                        </div>

                    </div>
                </div>

                <!-- drop down menu -->
                <DropDownMenu>
                    <template v-slot:button>
                        <IconButton v-if="node" class="mx-2 bg-transparent text-gray-700">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
                            </svg>
                        </IconButton>
                    </template>
                    <template v-slot:items>

                        <!-- node details -->
                        <div class="p-2 border-b">
                            <div class="text-sm text-gray-500 font-semibold">{{ getNodeLongName(node.num) }}</div>
                            <div class="text-sm text-gray-500">{{ getNodeHexId(node.num) }}</div>
                        </div>

                        <!-- node info button -->
                        <RouterLink :to="{ name: 'node', params: { nodeId: node.num }}">
                            <DropDownMenuItem>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-5">
                                    <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 0 1 .67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 1 1-.671-1.34l.041-.022ZM12 9a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clip-rule="evenodd" />
                                </svg>
                                <span>Node Info</span>
                            </DropDownMenuItem>
                        </RouterLink>

                        <!-- direct message button -->
                        <RouterLink :to="{ name: 'node.messages', params: { nodeId: node.num }}">
                            <DropDownMenuItem>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-5">
                                    <path fill-rule="evenodd" d="M4.804 21.644A6.707 6.707 0 0 0 6 21.75a6.721 6.721 0 0 0 3.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 0 1-.814 1.686.75.75 0 0 0 .44 1.223ZM8.25 10.875a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25ZM10.875 12a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875-1.125a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25Z" clip-rule="evenodd" />
                                </svg>
                                <span>Direct Message</span>
                            </DropDownMenuItem>
                        </RouterLink>

                        <!-- exchange node info button -->
                        <DropDownMenuItem @click="onRequestNodeInfo(node)">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-5">
                                <path fill-rule="evenodd" d="M4.5 3.75a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V6.75a3 3 0 0 0-3-3h-15Zm4.125 3a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Zm-3.873 8.703a4.126 4.126 0 0 1 7.746 0 .75.75 0 0 1-.351.92 7.47 7.47 0 0 1-3.522.877 7.47 7.47 0 0 1-3.522-.877.75.75 0 0 1-.351-.92ZM15 8.25a.75.75 0 0 0 0 1.5h3.75a.75.75 0 0 0 0-1.5H15ZM14.25 12a.75.75 0 0 1 .75-.75h3.75a.75.75 0 0 1 0 1.5H15a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5h3.75a.75.75 0 0 0 0-1.5H15Z" clip-rule="evenodd" />
                            </svg>
                            <span>Request Node Info</span>
                        </DropDownMenuItem>

                        <!-- forget node button -->
                        <DropDownMenuItem @click="onDeleteNode(node)" class="border-t">
                            <svg class="size-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clip-rule="evenodd" />
                            </svg>
                            <span class="text-red-500">Forget Node</span>
                        </DropDownMenuItem>

                    </template>
                </DropDownMenu>

            </div>
        </div>

    </div>
</template>

<script>
import NodeUtils from "../../js/NodeUtils.js";
import moment from "moment";
import NodeIcon from "./NodeIcon.vue";
import GlobalState from "../../js/GlobalState.js";
import IconButton from "../IconButton.vue";
import DropDownMenu from "../DropDownMenu.vue";
import NodeAPI from "../../js/NodeAPI.js";
import DropDownMenuItem from "../DropDownMenuItem.vue";

export default {
    name: 'NodesList',
    components: {DropDownMenuItem, DropDownMenu, IconButton, NodeIcon},
    emits: [
        "node-click",
    ],
    props: {
        selectedNodeId: Number,
        nodes: Array,
    },
    data() {
        return {
            nodesSearchTerm: "",
        };
    },
    methods: {
        onNodeClick(node) {
            this.$emit("node-click", node);
        },
        getNodeHexId: (nodeId) => NodeUtils.getNodeHexId(nodeId),
        getNodeShortName: (nodeId) => NodeUtils.getNodeShortName(nodeId),
        getNodeLongName: (nodeId) => NodeUtils.getNodeLongName(nodeId),
        getNodeColour: (nodeId) => NodeUtils.getNodeColour(nodeId),
        getNodeTextColour: (nodeId) => NodeUtils.getNodeTextColour(nodeId),
        formatUnixSecondsAgo(unixSeconds) {
            return moment.unix(unixSeconds).fromNow();
        },
        onRequestNodeInfo(node) {

            // request node info
            NodeAPI.requestNodeInfo(node.num);

            // show alert
            alert("A request has been sent to the node to send its info back to us.");

        },
        async onDeleteNode(node) {

            // confirm user wants to remove this node
            if(!confirm("Are you sure you want to forget this node?")){
                return;
            }

            // remove node
            await NodeAPI.removeNodeByNum(node.num);

        },
    },
    computed: {
        GlobalState() {
            return GlobalState;
        },
        orderedNodes() {
            return this.nodesOrderedByLastHeard;
        },
        nodesOrderedByName() {
            // sort nodes by name asc
            return this.nodes.sort((nodeA, nodeB) => {
                const nodeALongName = this.getNodeLongName(nodeA.num);
                const nodeBLongName = this.getNodeLongName(nodeB.num);
                return nodeALongName.localeCompare(nodeBLongName);
            });
        },
        nodesOrderedByLastHeard() {
            // sort nodes by last heard desc
            return this.nodes.sort((nodeA, nodeB) => {
                const nodeALastHeard = nodeA.lastHeard;
                const nodeBLastHeard = nodeB.lastHeard;
                return nodeBLastHeard - nodeALastHeard;
            });
        },
        searchedNodes() {
            return this.orderedNodes.filter((node) => {
                const search = this.nodesSearchTerm.toLowerCase();
                const matchesId = node.num.toString().includes(search);
                const matchesHexId = this.getNodeHexId(node.num).toLowerCase().includes(search);
                const matchesShortName = this.getNodeShortName(node.num).toLowerCase().includes(search);
                const matchesLongName = this.getNodeLongName(node.num).toLowerCase().includes(search);
                return matchesId || matchesHexId || matchesShortName || matchesLongName;
            });
        },
    },
}
</script>
