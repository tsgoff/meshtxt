<template>
    <div class="space-y-2">

        <!-- info -->
        <div class="flex flex-col mx-auto my-auto text-gray-700 text-center">
            <div class="mb-2 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" class="w-10">
                    <rect width="256" height="256" fill="none"/>
                    <circle cx="136" cy="64" r="24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
                    <line x1="8" y1="128" x2="200" y2="128" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
                    <polygon points="200 96 200 160 248 128 200 96" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
                    <rect x="112" y="168" width="48" height="48" rx="8" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
                    <path d="M112,64H72a8,8,0,0,0-8,8V184a8,8,0,0,0,8,8h40" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
                </svg>
            </div>
            <div class="font-semibold">Not Connected</div>
            <div>Connect a Meshtastic device to continue</div>
        </div>

        <!-- bluetooth -->
        <button @click="connectViaBluetooth" type="button" class="w-full flex cursor-pointer bg-white rounded shadow px-3 py-2 text-black space-x-2 font-semibold hover:bg-gray-100">
            <span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" class="w-6">
                    <rect width="256" height="256" fill="none"/>
                    <polygon points="128 32 192 80 128 128 128 32" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
                    <polygon points="128 128 192 176 128 224 128 128" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
                    <line x1="64" y1="80" x2="128" y2="128" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
                    <line x1="64" y1="176" x2="128" y2="128" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
                </svg>
            </span>
            <span>Connect via Bluetooth</span>
        </button>

        <!-- serial -->
        <button @click="connectViaSerial" type="button" class="w-full flex cursor-pointer bg-white rounded shadow px-3 py-2 text-black space-x-2 font-semibold hover:bg-gray-100">
            <span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" class="w-6">
                    <rect width="256" height="256" fill="none"/>
                    <circle cx="136" cy="64" r="24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
                    <line x1="8" y1="128" x2="200" y2="128" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
                    <polygon points="200 96 200 160 248 128 200 96" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
                    <rect x="112" y="168" width="48" height="48" rx="8" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
                    <path d="M112,64H72a8,8,0,0,0-8,8V184a8,8,0,0,0,8,8h40" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
                </svg>
            </span>
            <span>Connect via Serial</span>
        </button>

        <!-- http -->
        <button @click="connectViaHttp" type="button" class="w-full flex cursor-pointer bg-white rounded shadow px-3 py-2 text-black space-x-2 font-semibold hover:bg-gray-100">
            <span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
                </svg>
            </span>
            <span>Connect via HTTP</span>
        </button>

        <div class="text-center text-gray-500 text-sm">HTTP requires a proxy to bypass CORS</div>

    </div>

</template>

<script>
import Connection from "../../js/Connection.js";

export default {
    name: 'ConnectButtons',
    methods: {
        async connectViaBluetooth() {
            await Connection.connectViaBluetooth();
            this.$router.push({
                name: "main",
            });
        },
        async connectViaSerial() {
            await Connection.connectViaSerial();
            this.$router.push({
                name: "main",
            });
        },
        async connectViaHttp() {

            // ask for device address, and do nothing if not provided
            const address = prompt("Enter IP Address or Hostname");
            if(!address){
                return;
            }

            await Connection.connectViaHttp(address);

            this.$router.push({
                name: "main",
            });

        },
    },
}
</script>
