<template>
    <div class="flex bg-white p-2 border-b h-16">
        <div class="my-auto mr-2">
            <img src="/icon.png" class="size-12 rounded"/>
        </div>
        <div class="my-auto mr-auto">
            <div class="font-bold">MeshTXT</div>
            <div class="text-sm">Built by <a href="https://liamcottle.com" target="_blank" class="text-blue-600 hover:underline">Liam Cottle</a></div>
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
