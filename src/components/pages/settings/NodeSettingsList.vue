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

            <div class="flex flex-col divide-y">

                <!-- user -->
                <RouterLink :to="{ name: 'node.settings.user', params: { nodeId: nodeId } }">
                    <div class="flex cursor-pointer px-2 py-3 bg-white hover:bg-gray-50">

                        <!-- leading -->
                        <div class="my-auto ml-2 mr-4 text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
                                <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z" />
                            </svg>
                        </div>

                        <!-- title -->
                        <div class="my-auto mr-auto">Edit User Info</div>

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

        </div>
    </div>
</template>

<script>
import GlobalState from "../../../js/GlobalState.js";
import NodeUtils from "../../../js/NodeUtils.js";

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
