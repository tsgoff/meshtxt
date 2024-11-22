<template>
    <div class="flex bg-white p-2 border-b h-16">
        <div class="my-auto mr-2">
            <img src="/icon.png" class="size-12 rounded"/>
        </div>
        <div class="my-auto mr-auto">
            <div class="font-bold">MeshTXT</div>
            <div class="text-sm">

                <!-- disconnected -->
                <span v-if="GlobalState.deviceStatus == null || GlobalState.deviceStatus === Types.DeviceStatusEnum.DeviceDisconnected">
                    Built by <a href="https://liamcottle.com" target="_blank" class="text-blue-600 hover:underline">Liam Cottle</a>
                </span>

                <!-- any other device state -->
                <span v-else>

                    <!-- restarting -->
                    <span v-if="GlobalState.deviceStatus === Types.DeviceStatusEnum.DeviceRestarting" class="text-orange-500">
                        Device Restarting...
                    </span>

                    <!-- connecting or reconnecting -->
                    <span v-else-if="GlobalState.deviceStatus === Types.DeviceStatusEnum.DeviceConnecting || GlobalState.deviceStatus === Types.DeviceStatusEnum.DeviceReconnecting" class="text-orange-500">
                        Device Connecting...
                    </span>

                    <!-- connected or configured -->
                    <span v-else-if="GlobalState.deviceStatus === Types.DeviceStatusEnum.DeviceConnected || GlobalState.deviceStatus === Types.DeviceStatusEnum.DeviceConfigured">
                        <span v-if="GlobalState.myNodeUser">[{{ GlobalState.myNodeUser.shortName }}] {{ GlobalState.myNodeUser.longName }}</span>
                        <span v-else>Connected</span>
                    </span>

                    <!-- configuring -->
                    <span v-else-if="GlobalState.deviceStatus === Types.DeviceStatusEnum.DeviceConfiguring" class="text-orange-500">
                        Device Configuring...
                    </span>

                    <!-- unknown device state -->
                    <span v-else class="text-orange-500">Device State: {{ GlobalState.deviceStatus }}</span>

                </span>

            </div>
        </div>
        <div class="my-auto flex font-semibold">

            <!-- connect button -->
            <RouterLink v-if="!GlobalState.isConnected" :to="{ name: 'connect' }">
                <div class="bg-blue-500 text-white px-2 py-1 rounded shadow hover:bg-blue-400">
                    Connect
                </div>
            </RouterLink>

            <!-- disconnect button -->
            <div v-else>
                <button @click="disconnect" type="button" class="bg-gray-500 text-white px-2 py-1 p-1 rounded shadow hover:bg-gray-400">
                    Disconnect
                </button>
            </div>

        </div>
    </div>
</template>

<script>
import GlobalState from "../js/GlobalState.js";
import Connection from "../js/Connection.js";
import { Types } from "@meshtastic/js";

export default {
    name: 'Header',
    methods: {
        async disconnect() {
            await Connection.disconnect();
        },
    },
    computed: {
        GlobalState() {
            return GlobalState;
        },
        Types() {
            return Types;
        },
    },
}
</script>
