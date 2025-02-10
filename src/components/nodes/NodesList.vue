<template>
    <div class="flex flex-col h-full w-full overflow-hidden">

        <!-- search -->
        <div v-if="nodes.length > 0" class="flex bg-white border-b border-gray-300 divide-x">
            <div class="flex p-1 w-full">
                <input v-model="nodesSearchTerm" type="text" :placeholder="`Search ${nodes.length} Nodes...`" class="h-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
            </div>
            <div class="flex text-gray-500">
                <DropDownMenu class="mx-auto my-auto">
                    <template v-slot:button>
                        <IconButton class="mx-1">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
                                <path d="M18.75 12.75h1.5a.75.75 0 0 0 0-1.5h-1.5a.75.75 0 0 0 0 1.5ZM12 6a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 12 6ZM12 18a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 12 18ZM3.75 6.75h1.5a.75.75 0 1 0 0-1.5h-1.5a.75.75 0 0 0 0 1.5ZM5.25 18.75h-1.5a.75.75 0 0 1 0-1.5h1.5a.75.75 0 0 1 0 1.5ZM3 12a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 3 12ZM9 3.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5ZM12.75 12a2.25 2.25 0 1 1 4.5 0 2.25 2.25 0 0 1-4.5 0ZM9 15.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z" />
                            </svg>
                        </IconButton>
                    </template>
                    <template v-slot:items>
                        <div class="p-2 border-b text-sm font-bold">Order</div>
                        <DropDownMenuItem @click="order = 'a-z'">
                            <input type="radio" :checked="order === 'a-z'"/>
                            <div class="my-auto" :class="{ 'font-bold': order === 'a-z' }">A-Z</div>
                        </DropDownMenuItem>
                        <DropDownMenuItem @click="order = 'heard-recently'">
                            <input type="radio" :checked="order === 'heard-recently'"/>
                            <div class="my-auto" :class="[ order === 'heard-recently' ? 'font-bold' : '' ]">Heard Recently</div>
                        </DropDownMenuItem>
                        <div class="p-2 border-b text-sm font-bold">Filter</div>
                        <DropDownMenuItem @click="filter = 'all'">
                            <input type="radio" :checked="filter === 'all'"/>
                            <div class="my-auto" :class="[ filter === 'all' ? 'font-bold' : '' ]">All</div>
                        </DropDownMenuItem>
                        <DropDownMenuItem @click="filter = 'favourites-only'">
                            <input type="radio" :checked="filter === 'favourites-only'"/>
                            <div class="my-auto" :class="[ filter === 'favourites-only' ? 'font-bold' : '' ]">Favourites Only</div>
                        </DropDownMenuItem>
                    </template>
                </DropDownMenu>
            </div>
        </div>

        <!-- nodes -->
        <div class="h-full overflow-y-auto">
            <NodeListItem :key="node.num" v-for="node of searchedNodes" :node="node" @click="onNodeClick(node)" :class="{ 'border-b': node.num === GlobalState.myNodeId }"/>
        </div>

    </div>
</template>

<script>
import NodeUtils from "../../js/NodeUtils.js";
import GlobalState from "../../js/GlobalState.js";
import NodeListItem from "./NodeListItem.vue";
import IconButton from "../IconButton.vue";
import DropDownMenu from "../DropDownMenu.vue";
import DropDownMenuItem from "../DropDownMenuItem.vue";

export default {
    name: 'NodesList',
    components: {
        DropDownMenuItem,
        DropDownMenu,
        IconButton,
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
            filter: window.localStorage.getItem("nodes_list_filter") ?? "all",
            order: window.localStorage.getItem("nodes_list_order") ?? "heard-recently",
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
        getNodesOrderedByName(nodes) {
            // sort nodes by name asc (using a shallow copy to ensure it updates automatically)
            return nodes.sort((nodeA, nodeB) => {
                const nodeALongName = this.getNodeLongName(nodeA.num);
                const nodeBLongName = this.getNodeLongName(nodeB.num);
                return nodeALongName.localeCompare(nodeBLongName);
            });
        },
        getNodesOrderedByLastHeard(nodes) {
            // sort nodes by last heard desc (using a shallow copy to ensure it updates automatically)
            return nodes.sort((nodeA, nodeB) => {
                const nodeALastHeard = nodeA.lastHeard;
                const nodeBLastHeard = nodeB.lastHeard;
                return nodeBLastHeard - nodeALastHeard;
            });
        },
        getOrderedNodes(nodes) {

            // get ordered nodes
            var orderedNodes = [];
            switch(this.order){
                case "a-z": {
                    orderedNodes = this.getNodesOrderedByName(nodes);
                    break;
                }
                case "heard-recently": {
                    orderedNodes = this.getNodesOrderedByLastHeard(nodes);
                    break;
                }
            }

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
        getFilteredNodes(nodes) {

            // filter by favourites only
            if(this.filter === "favourites-only"){
                return nodes.filter((node) => {
                    return node.isFavorite;
                });
            }

            // fallback to returning all nodes
            return nodes;

        },
    },
    computed: {
        GlobalState() {
            return GlobalState;
        },
        searchedNodes() {

            // filter and sort nodes
            var nodes = [...this.nodes];
            nodes = this.getFilteredNodes(nodes);
            nodes = this.getOrderedNodes(nodes);
            nodes = nodes.filter((node) => node != null);

            // search nodes
            nodes = nodes.filter((node) => {
                const search = this.nodesSearchTerm.toLowerCase();
                const matchesId = node.num.toString().includes(search);
                const matchesHexId = this.getNodeHexId(node.num).toLowerCase().includes(search);
                const matchesShortName = this.getNodeShortName(node.num).toLowerCase().includes(search);
                const matchesLongName = this.getNodeLongName(node.num).toLowerCase().includes(search);
                return matchesId || matchesHexId || matchesShortName || matchesLongName;
            });

            return nodes;

        },
    },
    watch: {
        filter() {
            window.localStorage.setItem("nodes_list_filter", this.filter);
        },
        order() {
            window.localStorage.setItem("nodes_list_order", this.order);
        },
    }
}
</script>
