<template>

    <div class="flex flex-col h-full w-full overflow-hidden">

        <!-- channels -->
        <div class="h-full overflow-y-auto">
            <ChannelListItem :key="channel.index" v-for="channel of enabledChannels" :channel="channel" @click="onChannelClick(channel)"/>
        </div>

    </div>

</template>

<script>
import {Protobuf} from "@meshtastic/js";
import ChannelListItem from "./ChannelListItem.vue";

export default {
    name: 'ChannelsList',
    components: {
        ChannelListItem,
    },
    emits: [
        "channel-click",
    ],
    props: {
        selectedChannelId: Number,
        channels: Array,
    },
    methods: {
        onChannelClick(channel) {
            this.$emit("channel-click", channel);
        },
    },
    computed: {
        enabledChannels() {
            return this.channels.filter((channel) => {
                return channel.role !== Protobuf.Channel.Channel_Role.DISABLED;
            });
        },
    },
}
</script>
