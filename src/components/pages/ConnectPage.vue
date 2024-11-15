<template>
    <Page>

        <!-- app bar -->
        <AppBar title="Connect" subtitle="Select a Connection Method"/>

        <!-- list -->
        <div class="mx-auto my-auto">

            <!-- bluetooth -->
            <div @click="connectViaBluetooth" class="flex cursor-pointer bg-blue-500 rounded shadow px-2 py-1 text-white space-x-1 font-semibold">
                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" class="w-6">
                        <rect width="256" height="256" fill="none"/>
                        <polygon points="128 32 192 80 128 128 128 32" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
                        <polygon points="128 128 192 176 128 224 128 128" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
                        <line x1="64" y1="80" x2="128" y2="128" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
                        <line x1="64" y1="176" x2="128" y2="128" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
                    </svg>
                </div>
                <div>Connect via Bluetooth</div>
            </div>

        </div>

    </Page>
</template>

<script>
import AppBar from "../AppBar.vue";
import Page from "./Page.vue";
import Connection from "../../js/Connection.js";

export default {
    name: 'ConnectPage',
    components: {
        Page,
        AppBar,
    },
    methods: {
        async connectViaBluetooth() {
            await Connection.connectViaBluetooth();
            this.$router.push({
                name: "main",
            });
        },
    },
}
</script>
