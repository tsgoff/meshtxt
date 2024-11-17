<template>
    <div class="flex cursor-pointer p-2 bg-white hover:bg-gray-50">

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
</template>

<script>
import NodeIcon from "./NodeIcon.vue";
import NodeUtils from "../../js/NodeUtils.js";
import NodeDropDownMenu from "./NodeDropDownMenu.vue";
import GlobalState from "../../js/GlobalState.js";
import TimeUtils from "../../js/TimeUtils.js";
import moment from "moment";

export default {
    name: 'NodeListItem',
    components: {
        NodeDropDownMenu,
        NodeIcon,
    },
    props: {
        node: Object,
    },
    methods: {
        getNodeLongName: (nodeId) => NodeUtils.getNodeLongName(nodeId),
        formatUnixSecondsAgo(unixSeconds) {
            return TimeUtils.getTimeAgoShortHand(moment.unix(unixSeconds).toDate());
        },
    },
    computed: {
        GlobalState() {
            return GlobalState;
        },
    },
}
</script>
