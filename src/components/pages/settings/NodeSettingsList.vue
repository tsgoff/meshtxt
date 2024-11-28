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

            <div class="flex flex-col">

                <!-- user -->
                <RouterLink :to="{ name: 'node.settings.user', params: { nodeId: nodeId } }">
                    <div class="flex cursor-pointer px-2 py-3 bg-white hover:bg-gray-50 border-b">

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

                <div @click="reboot(nodeId)" class="mt-4 flex cursor-pointer px-2 py-3 bg-white hover:bg-gray-50">

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

        </div>
    </div>
</template>

<script>
import GlobalState from "../../../js/GlobalState.js";
import NodeUtils from "../../../js/NodeUtils.js";
import NodeAPI from "../../../js/NodeAPI.js";
import DialogUtils from "../../../js/DialogUtils.js";

export default {
    name: 'SettingsList',
    props: {
        nodeId: String | Number,
    },
    methods: {
        getNodeHexId: (nodeId) => NodeUtils.getNodeHexId(nodeId),
        getNodeShortName: (nodeId) => NodeUtils.getNodeShortName(nodeId),
        getNodeLongName: (nodeId) => NodeUtils.getNodeLongName(nodeId),
        getNodeColour: (nodeId) => NodeUtils.getNodeColour(nodeId),
        getNodeTextColour: (nodeId) => NodeUtils.getNodeTextColour(nodeId),
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
