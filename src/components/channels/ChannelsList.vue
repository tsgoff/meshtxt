<template>
    <div class="w-full">
        <div v-for="channel of enabledChannels" @click="onChannelClick(channel)" class="flex cursor-pointer p-2 shadow border-l-2" :class="[ selectedChannelId === channel.index ? 'bg-gray-100 border-blue-500' : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-200']">

            <!-- channel info -->
            <div class="my-auto mr-auto">
                <div>
                    <span v-if="channel.settings.name.length > 0">{{ channel.settings.name }}</span>
                    <span v-else class="text-gray-500 italic">Unnamed Channel</span>
                </div>
                <div class="text-sm text-gray-500">
                    <span v-if="channel.role === Protobuf.Channel.Channel_Role.PRIMARY">Primary Channel</span>
                    <span v-else-if="channel.role === Protobuf.Channel.Channel_Role.SECONDARY">Secondary Channel</span>
                    <span v-else-if="channel.role === Protobuf.Channel.Channel_Role.DISABLED">Disabled Channel</span>
                    <span v-else>Unknown Channel Role</span>
                </div>
            </div>

            <!-- security badge -->
            <div class="my-auto">
                <ChannelPskBadge :channel="channel"/>
            </div>

        </div>
    </div>
</template>

<script>
import {
    Protobuf,
} from "@meshtastic/js";
import ChannelPskBadge from "./ChannelPskBadge.vue";
export default {
    name: 'ChannelsList',
    components: {ChannelPskBadge},
    emits: [
        "channel-click",
    ],
    props: {
        selectedChannelId: Number,
        channels: Array,
    },
    data() {
        return {

        };
    },
    methods: {
        onChannelClick(channel) {
            this.$emit("channel-click", channel);
        },
    },
    computed: {
        Protobuf() {
            return Protobuf;
        },
        enabledChannels() {
            return this.channels.filter((channel) => {
                return channel.role !== Protobuf.Channel.Channel_Role.DISABLED;
            });
        },
    },
}
</script>
