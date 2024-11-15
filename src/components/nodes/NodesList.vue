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
                <div class="my-auto mr-2">
                    <div class="flex rounded-full h-12 w-12 text-white shadow" :style="{ backgroundColor: NodeUtils.getNodeColour(node.num), color: NodeUtils.getNodeTextColour(node.num)}">
                        <div class="mx-auto my-auto drop-shadow-sm">{{ node.user.shortName }}</div>
                    </div>
                </div>

                <!-- name and info -->
                <div class="mr-2">
                    <div>{{ node.user.longName }}</div>
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
import NodeUtils from "../../js/node_utils.js";
import moment from "moment";

export default {
    name: 'NodesList',
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
        formatUnixSecondsAgo(unixSeconds) {
            return moment.unix(unixSeconds).fromNow();
        },
    },
    computed: {
        NodeUtils() {
            return NodeUtils;
        },
        nodesOrderedByName() {
            // sort nodes by name asc
            return this.nodes.sort((nodeA, nodeB) => {
                return nodeA.user.longName.localeCompare(nodeB.user.longName);
            });
        },
        searchedNodes() {
            return this.nodesOrderedByName.filter((node) => {
                const search = this.nodesSearchTerm.toLowerCase();
                const matchesShortName = node.user.shortName.toLowerCase().includes(search);
                const matchesLongName = node.user.longName.toLowerCase().includes(search);
                return matchesShortName || matchesLongName;
            });
        },
    },
}
</script>
