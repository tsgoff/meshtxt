<template>
    <Page>

        <!-- app bar -->
        <AppBar title="Channel Settings" :subtitle="subtitle">
            <template v-slot:leading>
                <NodeIcon v-if="node" :node-id="node.num" class="mr-3"/>
            </template>
            <template v-slot:trailing>
                <SaveButton :is-saving="isSaving" @click="save"/>
            </template>
        </AppBar>

        <!-- data -->
        <div class="flex h-full w-full overflow-hidden">
            <div class="w-full overflow-y-auto">

                <div class="bg-white divide-y">

                    <!-- channel name -->
                    <div class="w-full p-2">
                        <div class="block mb-2 text-sm font-medium text-gray-900">Name</div>
                        <input v-model="channelName" type="text" placeholder="e.g: Private" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
                    </div>

                    <!-- channel role -->
                    <div class="w-full p-2">
                        <div class="block mb-2 text-sm font-medium text-gray-900">Role</div>
                        <select v-model="channelRole" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
                            <option :value="Protobuf.Channel.Channel_Role.PRIMARY">Primary</option>
                            <option :value="Protobuf.Channel.Channel_Role.SECONDARY">Secondary</option>
                            <option :value="Protobuf.Channel.Channel_Role.DISABLED">Disabled</option>
                        </select>
                    </div>

                    <!-- pre shared key -->
                    <div class="w-full p-2">
                        <div class="block mb-2 text-sm font-medium text-gray-900">Pre-Shared Key</div>
                        <input v-model="channelKey" type="text" placeholder="e.g: AQ==" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
                    </div>

                </div>

            </div>
        </div>

    </Page>
</template>

<script>
import Page from "../Page.vue";
import AppBar from "../../AppBar.vue";
import SaveButton from "../../SaveButton.vue";
import GlobalState from "../../../js/GlobalState.js";
import NodeIcon from "../../nodes/NodeIcon.vue";
import NodeUtils from "../../../js/NodeUtils.js";
import {Protobuf} from "@meshtastic/js";
import PacketUtils from "../../../js/PacketUtils.js";
import NodeAPI from "../../../js/NodeAPI.js";
import DialogUtils from "../../../js/DialogUtils.js";

export default {
    name: 'node.settings.channels.edit',
    components: {
        NodeIcon,
        Page,
        AppBar,
        SaveButton,
    },
    props: {
        nodeId: String | Number,
        channelId: String | Number,
    },
    data() {
        return {
            channelName: null,
            channelRole: null,
            channelKey: null,
            isSaving: false,
        };
    },
    mounted() {

        // load channel info
        this.channelName = this.channel?.settings?.name;
        this.channelRole = this.channel?.role;
        this.channelKey = this.channel?.settings?.psk ? PacketUtils.uInt8ArrayToBase64(this.channel?.settings?.psk) : null;

    },
    methods: {
        getNodeLongName: (nodeId) => NodeUtils.getNodeLongName(nodeId),
        async save() {

            // do nothing if already saving
            if(this.isSaving){
                return;
            }

            // mark as saving
            this.isSaving = true;

            // create a clone of the channel object
            const channel = Protobuf.Channel.Channel.fromJson(this.channel.toJson());

            // set local values on channel object
            channel.settings.name = this.channelName;
            channel.role = this.channelRole;
            channel.settings.psk = PacketUtils.base64ToUInt8Array(this.channelKey);

            // save channel to node
            try {

                // save
                await NodeAPI.remoteAdminSetChannel(this.nodeId, channel);
                alert("Channel saved successfully");

                // save was successful, update original object from previous page in ui
                this.channel.settings.name = channel.settings.name;
                this.channel.role = channel.role;
                this.channel.settings.psk = channel.settings.psk;

                // fixme: don't really want to do this here?
                // update global state if this was our own node
                if(this.nodeId.toString() === GlobalState.myNodeId.toString()){
                    const channelsByIndex = {};
                    for(const channel of GlobalState.remoteNodeChannels[this.nodeId]){
                        channelsByIndex[channel.index] = channel;
                    }
                    GlobalState.channelsByIndex = channelsByIndex;
                }

            } catch(e) {
                DialogUtils.showErrorAlert(e);
            }

            // no longer saving
            this.isSaving = false;

        },
    },
    computed: {
        Protobuf() {
            return Protobuf;
        },
        node() {
            return GlobalState.nodesById[this.nodeId];
        },
        channel() {
            return GlobalState.remoteNodeChannels[this.nodeId].find((channel) => {
                return channel.index.toString() === this.channelId.toString();
            });
        },
        subtitle() {
            return this.node ? this.getNodeLongName(this.node.num) : "Unknown Node";
        },
    },
}
</script>
