<template>
    <div class="flex flex-col h-full w-full overflow-hidden">

        <!-- search -->
        <div v-if="nodes.length > 0" class="bg-white p-1 border-b border-gray-300">
            <input v-model="nodesSearchTerm" type="text" :placeholder="`Search ${nodes.length} Nodes...`" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
        </div>

        <!-- nodes -->
        <div class="h-full overflow-y-auto">
            <NodeListItem :key="node.num" v-for="node of searchedNodes" :node="node" @click="onNodeClick(node)"/>
        </div>

    </div>
</template>

<script>
import NodeUtils from "../../js/NodeUtils.js";
import GlobalState from "../../js/GlobalState.js";
import NodeListItem from "./NodeListItem.vue";

export default {
    name: 'NodesList',
    components: {
        NodeListItem,
    },
    emits: [
        "node-click",
    ],
    props: {
        nodes: Array,
    },
    data() {
        return {
            nodesSearchTerm: "",
        };
    },
    methods: {
        getNodeHexId: (nodeId) => NodeUtils.getNodeHexId(nodeId),
        getNodeShortName: (nodeId) => NodeUtils.getNodeShortName(nodeId),
        getNodeLongName: (nodeId) => NodeUtils.getNodeLongName(nodeId),
        onNodeClick(node) {
            this.$emit("node-click", node);
        },
    },
    computed: {
        GlobalState() {
            return GlobalState;
        },
        orderedNodes() {

            // get ordered nodes
            var orderedNodes = this.nodesOrderedByLastHeard;

            // find our node in the list
            const myNode = orderedNodes.find((node) => {
                return node.num === GlobalState.myNodeId;
            });

            // remove our node from the list
            orderedNodes = orderedNodes.filter((node) => {
                return node.num !== GlobalState.myNodeId;
            });

            // add our node to the start of the list
            orderedNodes.unshift(myNode);

            return orderedNodes;

        },
        nodesOrderedByName() {
            // sort nodes by name asc (using a shallow copy to ensure it updates automatically)
            return [...this.nodes].sort((nodeA, nodeB) => {
                const nodeALongName = this.getNodeLongName(nodeA.num);
                const nodeBLongName = this.getNodeLongName(nodeB.num);
                return nodeALongName.localeCompare(nodeBLongName);
            });
        },
        nodesOrderedByLastHeard() {
            // sort nodes by last heard desc (using a shallow copy to ensure it updates automatically)
            return [...this.nodes].sort((nodeA, nodeB) => {
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
