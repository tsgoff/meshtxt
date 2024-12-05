<template>
    <Page>

        <!-- app bar -->
        <AppBar title="Node Info" :subtitle="subtitle">
            <template v-slot:leading>
                <NodeIcon v-if="node" :node-id="node.num" class="mr-3"/>
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

                <!-- public key -->
                <div>
                    <div class="bg-gray-200 p-2 font-semibold">Public Key</div>
                    <ul role="list" class="flex-1 divide-y divide-gray-200">

                        <!-- id -->
                        <li class="flex p-3">
                            <div v-if="node.user?.publicKey != null && node.user.publicKey.length > 0" class="text-sm text-gray-700">{{
                                    convertPublicKeyToBase64(node.user.publicKey)
                                }}</div>
                            <div v-else class="text-sm text-gray-700">Unknown</div>
                        </li>

                    </ul>
                </div>

                <!-- position -->
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

                <!-- device metrics -->
                <div>
                    <div class="flex bg-gray-200 p-2 font-semibold items-center">
                        <div>Device Metrics</div>
                        <div class="ml-auto">
                            <RefreshButton @click="requestDeviceMetrics" :is-refreshing="isRequestingDeviceMetrics"/>
                        </div>
                    </div>
                    <ul role="list" class="flex-1 divide-y divide-gray-200">

                        <!-- battery level -->
                        <li class="flex p-3">
                            <div class="text-sm font-medium text-gray-900">Battery Level</div>
                            <div class="ml-auto text-sm text-gray-700">
                                <span v-if="node.deviceMetrics && node.deviceMetrics.batteryLevel != null">
                                    <span v-if="node.deviceMetrics.batteryLevel === 101">Plugged-In</span>
                                    <span v-else>{{ node.deviceMetrics.batteryLevel }}%</span>
                                </span>
                                <span v-else>???</span>
                            </div>
                        </li>

                        <!-- voltage -->
                        <li class="flex p-3">
                            <div class="text-sm font-medium text-gray-900">Voltage</div>
                            <div class="ml-auto text-sm text-gray-700">
                                <span v-if="node.deviceMetrics && node.deviceMetrics.voltage != null">{{ node.deviceMetrics.voltage.toFixed(2) }}v</span>
                                <span v-else>???</span>
                            </div>
                        </li>

                        <!-- channel utilization -->
                        <li class="flex p-3">
                            <div class="text-sm font-medium text-gray-900">Channel Utilization</div>
                            <div class="ml-auto text-sm text-gray-700">
                                <span v-if="node.deviceMetrics && node.deviceMetrics.channelUtilization != null">{{ node.deviceMetrics.channelUtilization.toFixed(2) }}%</span>
                                <span v-else>???</span>
                            </div>
                        </li>

                        <!-- air util tx -->
                        <li class="flex p-3">
                            <div class="text-sm font-medium text-gray-900">Air Util Tx</div>
                            <div class="ml-auto text-sm text-gray-700">
                                <span v-if="node.deviceMetrics && node.deviceMetrics.airUtilTx != null">{{ node.deviceMetrics.airUtilTx.toFixed(2) }}%</span>
                                <span v-else>???</span>
                            </div>
                        </li>

                        <!-- uptime -->
                        <li class="flex p-3">
                            <div class="text-sm font-medium text-gray-900">Uptime</div>
                            <div class="ml-auto text-sm text-gray-700">
                                <span v-if="node.deviceMetrics && node.deviceMetrics.uptimeSeconds != null">{{ formatUptimeSeconds(node.deviceMetrics.uptimeSeconds) }}</span>
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
import NodeAPI from "../../js/NodeAPI.js";
import DialogUtils from "../../js/DialogUtils.js";
import RefreshButton from "../RefreshButton.vue";

export default {
    name: 'NodePage',
    components: {
        RefreshButton,
        NodeDropDownMenu,
        Page,
        NodeIcon,
        AppBar,
    },
    props: {
        nodeId: String | Number,
    },
    data() {
        return {
            isRequestingDeviceMetrics: false,
        };
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
        convertPublicKeyToBase64: (publicKey) => NodeUtils.convertPublicKeyToBase64(publicKey),
        latLongIntegerToLatLong: (latLongInteger) => NodeUtils.latLongIntegerToLatLong(latLongInteger),
        formatUptimeSeconds: function(secondsToFormat) {
            secondsToFormat = Number(secondsToFormat);
            const days = Math.floor(secondsToFormat / (3600 * 24));
            const hours = Math.floor((secondsToFormat % (3600 * 24)) / 3600);
            const minutes = Math.floor((secondsToFormat % 3600) / 60);
            const seconds = Math.floor(secondsToFormat % 60);
            const daysPlural = days === 1 ? 'day' : 'days';
            return `${days} ${daysPlural} ${hours}h ${minutes}m ${seconds}s`;
        },
        onNodeDeleted() {

            // go back to main page
            this.$router.push({
                name: "main",
            });

        },
        async requestDeviceMetrics() {

            // do nothing if already requesting device metrics
            if(this.isRequestingDeviceMetrics){
                return;
            }

            // show loading
            this.isRequestingDeviceMetrics = true;

            try {

                // fetch device metrics from node
                const deviceMetrics = await NodeAPI.requestDeviceMetrics(this.node.num);

                // update this nodes device metrics
                this.node.deviceMetrics = deviceMetrics;

            } catch(e) {
                DialogUtils.showErrorAlert(e);
            }

            // no longer requesting device metrics
            this.isRequestingDeviceMetrics = false;

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
