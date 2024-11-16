<template>
    <div class="flex bg-white p-2 border-b h-16">
        <div class="my-auto mr-auto">

            <!-- title -->
            <div class="font-bold">MeshTXT</div>

            <!-- connected node info -->
            <div class="text-sm">
                <span v-if="GlobalState.isConnected && GlobalState.myNodeUser">[{{ GlobalState.myNodeUser.shortName }}] {{ GlobalState.myNodeUser.longName }}</span>
                <span v-else class="text-red-500">Not Connected</span>
            </div>

        </div>
        <div class="my-auto font-semibold">

            <!-- connect button -->
            <RouterLink v-if="!GlobalState.isConnected" :to="{ name: 'connect' }">
                <div class="bg-blue-500 text-white px-2 py-1 rounded shadow hover:bg-blue-400">
                    Connect
                </div>
            </RouterLink>

            <!-- disconnect button -->
            <button v-else @click="disconnect" type="button" class="bg-gray-500 text-white px-2 py-1 p-1 rounded shadow hover:bg-gray-400">
                Disconnect
            </button>

        </div>
    </div>
</template>

<script>
import GlobalState from "../js/GlobalState.js";
import Connection from "../js/Connection.js";

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
    },
}
</script>
