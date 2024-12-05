<template>
    <div class="flex flex-col h-full w-full overflow-hidden">
        <div class="h-full overflow-y-auto">

            <!-- node details -->
            <div class="flex flex-col items-center p-4 leading-tight">
                <div class="mb-2">
                    <div class="flex rounded-full h-20 w-20 text-white text-xl shadow" :style="{ backgroundColor: getNodeColour(nodeId), color: getNodeTextColour(nodeId)}">
                        <div class="mx-auto my-auto drop-shadow-sm">{{ getNodeShortName(nodeId) }}</div>
                    </div>
                </div>
                <div class="font-semibold">{{ getNodeLongName(nodeId) }}</div>
                <div class="text-sm text-gray-500">{{ getNodeHexId(nodeId) }} / {{ nodeId }}</div>
            </div>

            <!-- setting groups -->
            <div class="space-y-4">

                <!-- radio configuration -->
                <div class="flex flex-col divide-y bg-white">

                    <div class="bg-white p-2 font-semibold">Radio Configuration</div>

                    <!-- user -->
                    <RouterLink :to="{ name: 'node.settings.user', params: { nodeId: nodeId } }">
                        <div class="flex cursor-pointer px-2 py-3 bg-white hover:bg-gray-50">

                            <!-- leading -->
                            <div class="my-auto ml-2 mr-4 text-gray-500">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                </svg>
                            </div>

                            <!-- title -->
                            <div class="my-auto mr-auto">User</div>

                            <!-- trailing -->
                            <div class="my-auto mr-2 text-gray-500">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                                </svg>
                            </div>

                        </div>
                    </RouterLink>

                    <!-- channels -->
                    <RouterLink :to="{ name: 'node.settings.channels', params: { nodeId: nodeId } }">
                        <div class="flex cursor-pointer px-2 py-3 bg-white hover:bg-gray-50">

                            <!-- leading -->
                            <div class="my-auto ml-2 mr-4 text-gray-500">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                                </svg>
                            </div>

                            <!-- title -->
                            <div class="my-auto mr-auto">Channels</div>

                            <!-- trailing -->
                            <div class="my-auto mr-2 text-gray-500">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                                </svg>
                            </div>

                        </div>
                    </RouterLink>

                </div>

                <!-- commands -->
                <div class="flex flex-col divide-y bg-white">

                    <div class="bg-white p-2 font-semibold">Commands</div>

                    <div @click="getDeviceFirmwareVersion(nodeId)" class="flex cursor-pointer px-2 py-3 bg-white hover:bg-gray-50">

                        <!-- leading -->
                        <div class="my-auto ml-2 mr-4 text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
                            </svg>
                        </div>

                        <!-- title -->
                        <div class="my-auto mr-auto">Get Firmware Version</div>

                        <!-- trailing -->
                        <div class="my-auto mr-2 text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                            </svg>
                        </div>

                    </div>

                    <div @click="resetNodeDb(nodeId)" class="flex cursor-pointer px-2 py-3 bg-white hover:bg-gray-50">

                        <!-- leading -->
                        <div class="my-auto ml-2 mr-4 text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                        </div>

                        <!-- title -->
                        <div class="my-auto mr-auto">Reset Node DB</div>

                        <!-- trailing -->
                        <div class="my-auto mr-2 text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                            </svg>
                        </div>

                    </div>

                    <div @click="reboot(nodeId)" class="flex cursor-pointer px-2 py-3 bg-white hover:bg-gray-50">

                        <!-- leading -->
                        <div class="my-auto ml-2 mr-4 text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M5.636 5.636a9 9 0 1 0 12.728 0M12 3v9" />
                            </svg>
                        </div>

                        <!-- title -->
                        <div class="my-auto mr-auto">Reboot</div>

                        <!-- trailing -->
                        <div class="my-auto mr-2 text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                            </svg>
                        </div>

                    </div>

                </div>

                <!-- file system -->
                <div v-if="nodeId.toString() === GlobalState.myNodeId.toString()" class="flex flex-col divide-y bg-white">
                    <div class="bg-white p-2 font-semibold">File System</div>
                    <div v-for="fileInfo of GlobalState.myNodeFiles" class="flex p-2 bg-white">

                        <!-- leading -->
                        <div class="my-auto ml-2 mr-4 text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                            </svg>
                        </div>

                        <!-- title -->
                        <div class="my-auto mr-auto">
                            <div>{{ fileInfo.fileName }}</div>
                            <div class="text-sm text-gray-500">{{ fileInfo.sizeBytes }} bytes</div>
                        </div>

                        <!-- trailing -->
                        <div class="my-auto text-gray-500">
                            <IconButton @click="deleteFile(nodeId, fileInfo.fileName)">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                </svg>
                            </IconButton>
                        </div>

                    </div>
                </div>

            </div>

        </div>
    </div>
</template>

<script>
import GlobalState from "../../../js/GlobalState.js";
import NodeUtils from "../../../js/NodeUtils.js";
import NodeAPI from "../../../js/NodeAPI.js";
import DialogUtils from "../../../js/DialogUtils.js";
import IconButton from "../../IconButton.vue";

export default {
    name: 'SettingsList',
    components: {IconButton},
    props: {
        nodeId: String | Number,
    },
    methods: {
        getNodeHexId: (nodeId) => NodeUtils.getNodeHexId(nodeId),
        getNodeShortName: (nodeId) => NodeUtils.getNodeShortName(nodeId),
        getNodeLongName: (nodeId) => NodeUtils.getNodeLongName(nodeId),
        getNodeColour: (nodeId) => NodeUtils.getNodeColour(nodeId),
        getNodeTextColour: (nodeId) => NodeUtils.getNodeTextColour(nodeId),
        async getDeviceFirmwareVersion(nodeId) {
            try {
                const response = await NodeAPI.remoteAdminGetDeviceMetadata(nodeId);
                const firmwareVersion = response.firmwareVersion;
                alert(firmwareVersion ?? "Unknown Firmware Version");
            } catch(e) {
                DialogUtils.showErrorAlert(e);
            }
        },
        async reboot(nodeId) {

            // confirm user wants to reboot node
            if(!confirm("Are you sure you want to reboot this node?")){
                return;
            }

            try {
                await NodeAPI.remoteAdminReboot(nodeId);
                alert("Node has been asked to reboot!");
            } catch(e) {
                DialogUtils.showErrorAlert(e);
            }

        },
        async resetNodeDb(nodeId) {

            // confirm user wants to reset node db
            if(!confirm("Are you sure you want to reset this nodes Node DB?")){
                return;
            }

            try {
                await NodeAPI.remoteAdminResetNodeDb(nodeId);
                alert("Node has been asked to reset its Node DB. It will reboot afterwards.");
            } catch(e) {
                DialogUtils.showErrorAlert(e);
            }

        },
        async deleteFile(nodeId, filename) {

            // confirm user wants to delete file from node
            if(!confirm(`Are you sure you want to delete '${filename}' from this node?`)){
                return;
            }

            try {

                // delete file from node
                await NodeAPI.remoteAdminDeleteFile(nodeId, filename);

                // update local state
                GlobalState.myNodeFiles = GlobalState.myNodeFiles.filter((fileInfo) => {
                    return fileInfo.fileName !== filename;
                });

            } catch(e) {
                DialogUtils.showErrorAlert(e);
            }

        },
    },
    computed: {
        GlobalState() {
            return GlobalState;
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
