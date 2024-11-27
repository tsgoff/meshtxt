<template>
    <Page>

        <!-- app bar -->
        <AppBar title="User Settings" :subtitle="subtitle">
            <template v-slot:leading>
                <NodeIcon v-if="node" :node-id="node.num" class="mr-3"/>
            </template>
            <template v-slot:trailing>
                <SaveButton :is-saving="isSaving" @click="save"/>
            </template>
        </AppBar>

        <!-- loading -->
        <div v-if="isLoading" class="mx-auto my-auto p-2">
            <FetchingDataInfo/>
        </div>

        <!-- loaded -->
        <div v-else-if="user != null" class="flex h-full w-full overflow-hidden">

            <div class="w-full overflow-y-auto">

                <div class="bg-white divide-y">

                    <div class="w-full p-2">
                        <div class="block mb-2 text-sm font-medium text-gray-900">Short Name</div>
                        <input v-model="user.shortName" type="text" placeholder="e.g: LIAM" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
                    </div>

                    <div class="w-full p-2">
                        <div class="block mb-2 text-sm font-medium text-gray-900">Long Name</div>
                        <input v-model="user.longName" type="text" placeholder="e.g: Liam Cottle" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
                    </div>

                </div>

            </div>

        </div>

        <!-- failed to load -->
        <div v-else class="mx-auto my-auto p-2">
            <div class="flex flex-col mx-auto my-auto text-gray-700 text-center">
                <div class="mb-2 mx-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" class="size-10">
                        <path d="M235.81,75.79A27.91,27.91,0,0,1,216,84a28.49,28.49,0,0,1-5.67-.58l-30.57,56.77,0,0a28,28,0,1,1-44.43,6.49l-26.06-26.06A28.07,28.07,0,0,1,96,124a28.41,28.41,0,0,1-5.67-.58L59.76,180.18l0,0a28,28,0,1,1-39.6,0h0a28,28,0,0,1,25.47-7.61l30.57-56.77,0,0a28.05,28.05,0,0,1,0-39.61h0a28,28,0,0,1,44.43,33.12l26.06,26.06a28.1,28.1,0,0,1,19-2.77l30.57-56.77,0,0a28,28,0,0,1,0-39.6h0a28,28,0,0,1,39.6,39.6Z"></path>
                    </svg>
                </div>
                <div class="font-semibold">Failed to Load</div>
                <div>Please try again later...</div>
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
import DialogUtils from "../../../js/DialogUtils.js";
import SaveButton from "../../SaveButton.vue";
import FetchingDataInfo from "../../FetchingDataInfo.vue";

export default {
    name: 'UserSettingsPage',
    components: {
        FetchingDataInfo,
        SaveButton,
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
            user: null,
        };
    },
    mounted() {
        this.getOwner();
    },
    methods: {
        getNodeLongName: (nodeId) => NodeUtils.getNodeLongName(nodeId),
        async getOwner() {

            // mark as loading
            this.isLoading = true;

            // get owner info from node
            try {
                this.user = await NodeAPI.remoteAdminGetOwner(this.nodeId);
            } catch(e) {
                console.log(e);
            }

            // no longer loading
            this.isLoading = false;

        },
        async save() {

            // do nothing if already saving
            if(this.isSaving){
                return;
            }

            // mark as saving
            this.isSaving = true;

            // save owner info to node
            try {
                await NodeAPI.remoteAdminSetOwner(this.nodeId, this.user);
                DialogUtils.showSettingsSavedAlert();
            } catch(e) {
                console.log(e);
            }

            // no longer saving
            this.isSaving = false;

        },
    },
    computed: {
        node() {
            return GlobalState.nodesById[this.nodeId];
        },
        subtitle() {
            return this.node ? this.getNodeLongName(this.node.num) : "Unknown Node";
        },
    },
}
</script>
