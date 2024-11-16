<template>
    <div class="flex flex-col w-full overflow-hidden">

        <!-- search -->
        <div v-if="nodes.length > 0" class="bg-white p-1 border-b border-gray-300">
            <input v-model="nodesSearchTerm" type="text" :placeholder="`Search ${nodes.length} Nodes...`" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
        </div>

        <!-- nodes -->
        <div class="overflow-y-auto">
            <div v-for="node of searchedNodes" @click="onNodeClick(node)" class="flex cursor-pointer p-2 border-l-2" :class="[ selectedNodeId === node.num ? 'bg-gray-100 border-blue-500' : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-200']">

                <!-- icon -->
                <NodeIcon :node="node" class="my-auto mr-2"/>

                <!-- name and info -->
                <div class="mr-2">
                    <div>{{ getNodeLongName(node.num) }}</div>
                    <div class="text-sm text-gray-500">
                        <span>{{ node.hopsAway }} hops</span>
                        <span v-if="node.lastHeard"> • heard {{ formatUnixSecondsAgo(node.lastHeard) }}</span>
                    </div>
                </div>

            </div>
        </div>

    </div>
</template>

<script>
import NodeUtils from "../../js/NodeUtils.js";
import moment from "moment";
import NodeIcon from "./NodeIcon.vue";

export default {
    name: 'NodesList',
    components: {NodeIcon},
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
    },
    computed: {
        nodesOrderedByName() {
            // sort nodes by name asc
            return this.nodes.sort((nodeA, nodeB) => {
                const nodeALongName = this.getNodeLongName(nodeA.num);
                const nodeBLongName = this.getNodeLongName(nodeB.num);
                return nodeALongName.localeCompare(nodeBLongName);
            });
        },
        searchedNodes() {
            return this.nodesOrderedByName.filter((node) => {
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
