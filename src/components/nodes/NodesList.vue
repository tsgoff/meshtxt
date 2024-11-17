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
                        <div v-else class="flex space-x-1">

                            <span class="my-auto">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
                                    <path d="M9 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
                                    <path fill-rule="evenodd" d="M9.68 5.26a.75.75 0 0 1 1.06 0 3.875 3.875 0 0 1 0 5.48.75.75 0 1 1-1.06-1.06 2.375 2.375 0 0 0 0-3.36.75.75 0 0 1 0-1.06Zm-3.36 0a.75.75 0 0 1 0 1.06 2.375 2.375 0 0 0 0 3.36.75.75 0 1 1-1.06 1.06 3.875 3.875 0 0 1 0-5.48.75.75 0 0 1 1.06 0Z" clip-rule="evenodd" />
                                    <path fill-rule="evenodd" d="M11.89 3.05a.75.75 0 0 1 1.06 0 7 7 0 0 1 0 9.9.75.75 0 1 1-1.06-1.06 5.5 5.5 0 0 0 0-7.78.75.75 0 0 1 0-1.06Zm-7.78 0a.75.75 0 0 1 0 1.06 5.5 5.5 0 0 0 0 7.78.75.75 0 1 1-1.06 1.06 7 7 0 0 1 0-9.9.75.75 0 0 1 1.06 0Z" clip-rule="evenodd" />
                                </svg>
                            </span>

                            <!-- last heard -->
                            <span class="flex my-auto text-sm text-gray-500 space-x-1">
                                {{ formatUnixSecondsAgo(node.lastHeard) }}
                            </span>

                            <!-- hops away -->
                            <span class="flex my-auto text-sm text-gray-500 space-x-1">
                                <span>•</span>
                                <span v-if="node.hopsAway === -1">???</span>
                                <span v-else-if="node.hopsAway === 0">Direct</span>
                                <span v-else-if="node.hopsAway === 1">1 Hop</span>
                                <span v-else>{{ node.hopsAway }} Hops</span>
                            </span>

                        </div>

                    </div>
                </div>

                <!-- node dropdown menu -->
                <NodeDropDownMenu :node="node"/>

            </div>
        </div>

    </div>
</template>

<script>
import NodeUtils from "../../js/NodeUtils.js";
import moment from "moment";
import NodeIcon from "./NodeIcon.vue";
import GlobalState from "../../js/GlobalState.js";
import NodeDropDownMenu from "./NodeDropDownMenu.vue";
import TimeUtils from "../../js/TimeUtils.js";

export default {
    name: 'NodesList',
    components: {
        NodeDropDownMenu,
        NodeIcon,
    },
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
            return TimeUtils.getTimeAgoShortHand(moment.unix(unixSeconds).toDate());
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
