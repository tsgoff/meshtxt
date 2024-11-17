<template>
    <Page>

        <!-- app bar -->
        <AppBar title="Node Info" :subtitle="subtitle">
            <template v-slot:leading>
                <NodeIcon v-if="node" :node="node" class="mr-3"/>
            </template>
            <template v-slot:trailing>
                <NodeDropDownMenu v-if="node" :node="node" @node-deleted="onNodeDeleted"/>
            </template>
        </AppBar>

        <!-- list -->
        <div v-if="node" class="flex flex-col h-full w-full overflow-hidden">
            <div class="bg-white overflow-y-auto">

                <!-- details -->
                <div>
                    <div class="bg-gray-200 p-2 font-semibold">Details</div>
                    <ul role="list" class="flex-1 divide-y divide-gray-200">

                        <!-- id -->
                        <li class="flex p-3">
                            <div class="text-sm font-medium text-gray-900">ID</div>
                            <div class="ml-auto text-sm text-gray-700">{{ node.num }}</div>
                        </li>

                        <!-- hex id -->
                        <li class="flex p-3">
                            <div class="text-sm font-medium text-gray-900">Hex ID</div>
                            <div class="ml-auto text-sm text-gray-700">{{ getNodeHexId(node.num) }}</div>
                        </li>

                        <!-- role -->
                        <li class="flex p-3">
                            <div class="text-sm font-medium text-gray-900">Role</div>
                            <div class="ml-auto text-sm text-gray-700">{{ getRoleName(node.user?.role) ?? "???" }}</div>
                        </li>

                        <!-- hardware -->
                        <li class="flex p-3">
                            <div class="text-sm font-medium text-gray-900">Hardware</div>
                            <div class="ml-auto text-sm text-gray-700">{{ getHardwareName(node.user?.hwModel) ?? "???" }}</div>
                        </li>

                        <!-- last heard -->
                        <li class="flex p-3">
                            <div class="text-sm font-medium text-gray-900">Last Heard</div>
                            <div class="ml-auto text-sm text-gray-700">{{ node.lastHeard ? formatFromNow(node.lastHeard) : "???" }}</div>
                        </li>

                    </ul>
                </div>

                <div>
                    <div class="flex bg-gray-200 p-2 font-semibold">Position</div>
                    <ul role="list" class="flex-1 divide-y divide-gray-200">

                        <!-- position -->
                        <li class="flex p-3">
                            <div class="text-sm font-medium text-gray-900">Lat/Long</div>
                            <div class="ml-auto text-sm text-gray-700">
                                <span v-if="node.position && node.position.latitudeI && node.position.longitudeI">{{ latLongIntegerToLatLong(node.position.latitudeI) }}, {{ latLongIntegerToLatLong(node.position.longitudeI) }}</span>
                                <span v-else>???</span>
                            </div>
                        </li>

                        <!-- altitude -->
                        <li class="flex p-3">
                            <div class="text-sm font-medium text-gray-900">Altitude</div>
                            <div class="ml-auto text-sm text-gray-700">
                                <span v-if="node.position && node.position.altitude != null">{{ node.position.altitude }}</span>
                                <span v-else>???</span>
                            </div>

                        </li>
                    </ul>
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
import moment from "moment";
import NodeDropDownMenu from "../nodes/NodeDropDownMenu.vue";

export default {
    name: 'NodePage',
    components: {
        NodeDropDownMenu,
        Page,
        NodeIcon,
        AppBar,
    },
    props: {
        nodeId: String | Number,
    },
    mounted() {

        // redirect to main page if node not found
        if(!this.node){
            this.$router.push({
                name: "main",
            });
            return;
        }

    },
    methods: {
        formatFromNow: (unixSeconds) => moment.unix(unixSeconds).fromNow(),
        getNodeHexId: (roleId) => NodeUtils.getNodeHexId(roleId),
        getRoleName: (roleId) => NodeUtils.getRoleName(roleId),
        getHardwareName: (roleId) => NodeUtils.getHardwareName(roleId),
        latLongIntegerToLatLong: (latLongInteger) => NodeUtils.latLongIntegerToLatLong(latLongInteger),
        onNodeDeleted() {

            // go back to main page
            this.$router.push({
                name: "main",
            });

        },
    },
    computed: {
        node() {
            return GlobalState.nodesById[this.nodeId];
        },
        subtitle() {
            return this.node?.user?.longName || 'Unknown Node';
        },
    },
}
</script>
