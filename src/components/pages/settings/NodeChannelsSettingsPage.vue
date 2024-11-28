<template>
    <Page>

        <!-- app bar -->
        <AppBar title="Node Channels" :subtitle="subtitle">
            <template v-slot:leading>
                <NodeIcon v-if="node" :node-id="node.num" class="mr-3"/>
            </template>
        </AppBar>

        <!-- loading -->
        <div v-if="isLoading" class="mx-auto my-auto p-2">
            <div class="flex flex-col mx-auto my-auto text-gray-700 text-center">
                <div class="mb-2 mx-auto">
                    <svg class="animate-spin size-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
                <div class="font-semibold">Please Wait</div>
                <div>{{ loadingStatus }}</div>
            </div>
        </div>

        <!-- loaded -->
        <div v-else-if="channels != null" class="flex h-full w-full overflow-hidden">

            <div class="w-full overflow-y-auto">
                <div v-for="channel of channels" class="flex cursor-pointer p-2 bg-white hover:bg-gray-50">
                    <div class="flex my-auto mr-4 size-12 bg-gray-200 rounded-full text-black">
                        <span class="mx-auto my-auto">{{ channel.index }}</span>
                    </div>
                    <div class="my-auto">
                        <div>{{ getChannelName(channel) }}</div>
                        <div class="text-sm text-gray-500">
                            <span v-if="channel.role === Protobuf.Channel.Channel_Role.PRIMARY">Primary Channel</span>
                            <span v-else-if="channel.role === Protobuf.Channel.Channel_Role.SECONDARY">Secondary Channel</span>
                            <span v-else-if="channel.role === Protobuf.Channel.Channel_Role.DISABLED">Disabled Channel</span>
                            <span v-else>Unknown Channel Role</span>
                        </div>
                    </div>
                </div>
            </div>

        </div>

        <!-- failed to load -->
        <div v-else class="mx-auto my-auto p-2">

            <!-- info -->
            <div class="flex flex-col mx-auto my-auto text-gray-700 text-center">
                <div class="mb-2 mx-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-10">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                    </svg>
                </div>
                <div class="font-semibold">{{ errorTitle }}</div>
                <div>{{ errorSubtitle }}</div>
            </div>

            <!-- retry button -->
            <div class="w-full mt-2">
                <button @click="getChannels" type="button" class="mx-auto flex cursor-pointer bg-white rounded shadow px-3 py-2 text-black font-semibold hover:bg-gray-100">
                    Try Again
                </button>
            </div>

        </div>

    </Page>
</template>

<script>
import Page from "../Page.vue";
import AppBar from "../../AppBar.vue";
import IconButton from "../../IconButton.vue";
import GlobalState from "../../../js/GlobalState.js";
import NodeIcon from "../../nodes/NodeIcon.vue";
import NodeUtils from "../../../js/NodeUtils.js";
import NodeAPI from "../../../js/NodeAPI.js";
import FetchingDataInfo from "../../FetchingDataInfo.vue";
import RoutingError from "../../../js/exceptions/RoutingError.js";
import ChannelUtils from "../../../js/ChannelUtils.js";
import {Protobuf} from "@meshtastic/js";

export default {
    name: 'NodeChannelsSettingsPage',
    components: {
        FetchingDataInfo,
        NodeIcon,
        IconButton,
        AppBar,
        Page,
    },
    props: {
        nodeId: String | Number,
    },
    data() {
        return {

            isLoading: false,
            isSaving: false,

            errorTitle: null,
            errorSubtitle: null,

            loadingStatus: null,

            loraConfig: null,
            channels: null,
            channelsLoaded: 0,

        };
    },
    mounted() {
        this.getChannels();
    },
    methods: {
        getNodeLongName: (nodeId) => NodeUtils.getNodeLongName(nodeId),
        getChannelName(channel) {
            return ChannelUtils.getChannelNameFromChannelAndLoraConfig(channel, this.loraConfig);
        },
        async getChannels() {

            // mark as loading
            this.isLoading = true;
            this.errorTitle = null;
            this.errorSubtitle = null;
            this.loraConfig = null;
            this.channels = [];
            this.channelsLoaded = 0;

            // get channels from node
            try {

                // load lora config
                this.loadingStatus = "Fetching Lora Config";
                const loraConfig = await NodeAPI.remoteAdminGetLoraConfig(this.nodeId);

                // load channels
                const channels = [];
                const channelsToLoad = 8;
                for(var channelIndex = 0; channelIndex < channelsToLoad; channelIndex++){

                    // to fetch the first channel (primary) you must send a channel index of 1
                    this.loadingStatus = `Fetching Channel ${channelIndex + 1} / ${channelsToLoad}`;
                    const channel = await NodeAPI.remoteAdminGetChannel(this.nodeId, channelIndex + 1);

                    // if we find a disabled channel, don't add it to the list. we can also stop loading more channels
                    // as the device always returns disabled channels after active channels
                    if(channel.role === Protobuf.Channel.Channel_Role.DISABLED){
                        break;
                    }

                    // add to channels list
                    channels.push(channel);
                    this.channelsLoaded = channels.length;

                }

                // update channels list in ui after all channels loaded
                this.loraConfig = loraConfig;
                this.channels = channels;

            } catch(e) {

                // check if this is a routing error
                if(e instanceof RoutingError){
                    this.errorTitle = "Routing Error";
                    this.errorSubtitle = e.getRoutingErrorMessage();
                    return;
                }

                // standard error
                this.errorTitle = "Failed to Load";
                this.errorSubtitle = e;

            } finally {

                // no longer loading
                this.isLoading = false;

            }

        },
    },
    computed: {
        Protobuf() {
            return Protobuf;
        },
        node() {
            return GlobalState.nodesById[this.nodeId];
        },
        subtitle() {
            return this.node ? this.getNodeLongName(this.node.num) : "Unknown Node";
        },
    },
}
</script>
