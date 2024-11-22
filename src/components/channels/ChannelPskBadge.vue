<template>
    <div>

        <!-- no key -->
        <div v-if="channel.settings.psk == null || channel.settings.psk.length === 0" @click="onNoKeyClick">
            <div class="cursor-pointer flex space-x-1 bg-gray-50 rounded-md px-2 py-1 text-xs text-gray-700 border border-gray-700 font-medium">
                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-4">
                        <path fill-rule="evenodd" d="M14.5 1A4.5 4.5 0 0 0 10 5.5V9H3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-1.5V5.5a3 3 0 1 1 6 0v2.75a.75.75 0 0 0 1.5 0V5.5A4.5 4.5 0 0 0 14.5 1Z" clip-rule="evenodd" />
                    </svg>
                </div>
                <div class="hidden sm:block">No Key</div>
            </div>
        </div>

        <!-- default key -->
        <div v-else-if="isDefaultPsk(channel.settings.psk)" @click="onDefaultKeyClick">
            <div class="cursor-pointer flex space-x-1 bg-gray-50 rounded-md px-2 py-1 text-xs text-gray-700 border border-gray-700 font-medium">
                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-4">
                        <path fill-rule="evenodd" d="M14.5 1A4.5 4.5 0 0 0 10 5.5V9H3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-1.5V5.5a3 3 0 1 1 6 0v2.75a.75.75 0 0 0 1.5 0V5.5A4.5 4.5 0 0 0 14.5 1Z" clip-rule="evenodd" />
                    </svg>
                </div>
                <div class="hidden sm:block">Default Key</div>
            </div>
        </div>

        <!-- 8-bit key -->
        <div v-else-if="channel.settings.psk.length === 1" @click="on8BitKeyClick">
            <div class="cursor-pointer flex space-x-1 bg-gray-50 rounded-md px-2 py-1 text-xs text-gray-700 border border-gray-700 font-medium">
                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-4">
                        <path fill-rule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clip-rule="evenodd" />
                    </svg>
                </div>
                <div class="hidden sm:block">8-Bit Key</div>
            </div>
        </div>

        <!-- 128-bit key -->
        <div v-else-if="channel.settings.psk.length === 16" @click="on128BitKeyClick">
            <div class="cursor-pointer flex space-x-1 bg-green-50 rounded-md px-2 py-1 text-xs text-green-700 border border-green-700 font-medium">
                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-4">
                        <path fill-rule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clip-rule="evenodd" />
                    </svg>
                </div>
                <div class="hidden sm:block">128-Bit Key</div>
            </div>
        </div>

        <!-- 256-bit key -->
        <div v-else-if="channel.settings.psk.length === 32" @click="on256BitKeyClick">
            <div class="cursor-pointer flex space-x-1 bg-green-50 rounded-md px-2 py-1 text-xs text-green-700 border border-green-700 font-medium">
                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-4">
                        <path fill-rule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clip-rule="evenodd" />
                    </svg>
                </div>
                <div class="hidden sm:block">256-Bit Key</div>
            </div>
        </div>

    </div>
</template>

<script>

import SecurityUtils from "../../js/SecurityUtils.js";

export default {
    name: 'ChannelPskBadge',
    props: {
        channel: Object,
    },
    methods: {
        isDefaultPsk: (psk) => SecurityUtils.isDefaultPsk(psk),
        onNoKeyClick() {
            alert("Messages sent to this channel are not encrypted and can be read by anyone.");
        },
        onDefaultKeyClick() {
            alert("Messages sent to this channel are encrypted with the default key and can be read by anyone.");
        },
        on8BitKeyClick() {
            alert("Messages sent to this channel are encrypted with a custom 8-Bit key and could easily be brute forced and read by anyone.");
        },
        on128BitKeyClick() {
            alert("Messages sent to this channel are encrypted with a custom 128-Bit key and can only be decrypted and read by others that know this key.");
        },
        on256BitKeyClick() {
            alert("Messages sent to this channel are encrypted with a custom 256-Bit key and can only be decrypted and read by others that know this key.");
        },
    },
}
</script>
