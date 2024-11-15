<template>
    <Page>

        <!-- app bar -->
        <AppBar :title="title" subtitle="Node Info">
            <template v-slot:leading>
                <NodeIcon v-if="node" :node="node" class="mr-3"/>
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
                            <div class="ml-auto text-sm text-gray-700">{{ node.user.id }}</div>
                        </li>

                        <!-- role -->
                        <li class="flex p-3">
                            <div class="text-sm font-medium text-gray-900">Role</div>
                            <div class="ml-auto text-sm text-gray-700">{{ getRoleName(node.user.role) ?? "???" }}</div>
                        </li>

                        <!-- hardware -->
                        <li class="flex p-3">
                            <div class="text-sm font-medium text-gray-900">Hardware</div>
                            <div class="ml-auto text-sm text-gray-700">{{ getHardwareName(node.user.hwModel) ?? "???" }}</div>
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

export default {
    name: 'NodePage',
    components: {
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
        getRoleName: (roleId) => NodeUtils.getRoleName(roleId),
        getHardwareName: (roleId) => NodeUtils.getHardwareName(roleId),
        latLongIntegerToLatLong: (latLongInteger) => NodeUtils.latLongIntegerToLatLong(latLongInteger),
    },
    computed: {
        node() {
            return GlobalState.nodesById[this.nodeId];
        },
        title() {
            return this.node?.user?.longName || 'Unknown Node';
        },
    },
}
</script>
