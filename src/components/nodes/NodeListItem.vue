<template>
    <div class="flex cursor-pointer p-2 bg-white hover:bg-gray-50">

        <!-- icon -->
        <NodeIcon :node-id="node.num" class="my-auto mr-2"/>

        <!-- name and info -->
        <div class="mr-auto">
            <div>{{ getNodeLongName(node.num) }}</div>
            <div class="text-sm text-gray-500">

                <!-- our node info -->
                <div v-if="node.num === GlobalState.myNodeId">
                    You are using this node
                </div>

                <!-- other node info -->
                <div v-else class="flex space-x-1">

                    <span class="my-auto">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
                            <path d="M9 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
                            <path fill-rule="evenodd" d="M9.68 5.26a.75.75 0 0 1 1.06 0 3.875 3.875 0 0 1 0 5.48.75.75 0 1 1-1.06-1.06 2.375 2.375 0 0 0 0-3.36.75.75 0 0 1 0-1.06Zm-3.36 0a.75.75 0 0 1 0 1.06 2.375 2.375 0 0 0 0 3.36.75.75 0 1 1-1.06 1.06 3.875 3.875 0 0 1 0-5.48.75.75 0 0 1 1.06 0Z" clip-rule="evenodd" />
                            <path fill-rule="evenodd" d="M11.89 3.05a.75.75 0 0 1 1.06 0 7 7 0 0 1 0 9.9.75.75 0 1 1-1.06-1.06 5.5 5.5 0 0 0 0-7.78.75.75 0 0 1 0-1.06Zm-7.78 0a.75.75 0 0 1 0 1.06 5.5 5.5 0 0 0 0 7.78.75.75 0 1 1-1.06 1.06 7 7 0 0 1 0-9.9.75.75 0 0 1 1.06 0Z" clip-rule="evenodd" />
                        </svg>
                    </span>

                    <!-- last heard -->
                    <span class="flex my-auto text-sm text-gray-500 space-x-1">
                        {{ formatUnixSecondsAgo(node.lastHeard) }}
                    </span>

                    <!-- hops away -->
                    <span class="flex my-auto text-sm text-gray-500 space-x-1">
                        <span>•</span>
                        <span v-if="node.hopsAway === -1">???</span>
                        <span v-else-if="node.hopsAway === 0">Direct</span>
                        <span v-else-if="node.hopsAway === 1">1 Hop</span>
                        <span v-else>{{ node.hopsAway }} Hops</span>
                    </span>

                    <!-- snr (only shown for direct nodes) -->
                    <span v-if="node.hopsAway === 0" class="flex my-auto text-sm text-gray-500 space-x-1">
                        <span>• SNR {{ node.snr }}</span>
                    </span>

                </div>

            </div>
        </div>

        <!-- unread messages count -->
        <div v-if="unreadMessagesCount > 0" class="my-auto">
            <div class="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 rounded-full shadow">
                <span v-if="unreadMessagesCount >= 100">99</span>
                <span>{{ unreadMessagesCount }}</span>
            </div>
        </div>

        <!-- favourite icon for other nodes -->
        <div v-if="node.num !== GlobalState.myNodeId" class="ml-2 my-auto">
            <IconButton @click.stop="toggleFavouriteNode(node)" class="bg-transparent">
                <span v-if="node.isFavorite" class="text-yellow-500">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
                        <path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clip-rule="evenodd" />
                    </svg>
                </span>
                <span v-else class="text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                    </svg>
                </span>
            </IconButton>
        </div>

        <!-- our node battery level -->
        <div v-if="node.num === GlobalState.myNodeId && node.deviceMetrics && node.deviceMetrics.batteryLevel != null" class="ml-1 my-auto flex text-gray-500">
            <div class="my-auto text-sm">
                <span v-if="node.deviceMetrics.batteryLevel === 101">CHG</span>
                <span v-else>{{ node.deviceMetrics.batteryLevel }}%</span>
            </div>
            <div class="my-auto">

                <!-- 101% - battery-charging-vertical -->
                <div v-if="node.deviceMetrics.batteryLevel === 101">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" class="size-5">
                        <path d="M150.81,131.79a8,8,0,0,1,.35,7.79l-16,32a8,8,0,0,1-14.32-7.16L131.06,144H112a8,8,0,0,1-7.16-11.58l16-32a8,8,0,1,1,14.32,7.16L124.94,128H144A8,8,0,0,1,150.81,131.79ZM96,16h64a8,8,0,0,0,0-16H96a8,8,0,0,0,0,16ZM200,56V224a24,24,0,0,1-24,24H80a24,24,0,0,1-24-24V56A24,24,0,0,1,80,32h96A24,24,0,0,1,200,56Zm-16,0a8,8,0,0,0-8-8H80a8,8,0,0,0-8,8V224a8,8,0,0,0,8,8h96a8,8,0,0,0,8-8Z"></path>
                    </svg>
                </div>

                <!-- 100% - battery-vertical-full -->
                <div v-else-if="node.deviceMetrics.batteryLevel >= 90">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" class="size-5">
                        <path d="M88,8a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H96A8,8,0,0,1,88,8ZM200,56V224a24,24,0,0,1-24,24H80a24,24,0,0,1-24-24V56A24,24,0,0,1,80,32h96A24,24,0,0,1,200,56Zm-16,0a8,8,0,0,0-8-8H80a8,8,0,0,0-8,8V224a8,8,0,0,0,8,8h96a8,8,0,0,0,8-8ZM160,72H96a8,8,0,0,0,0,16h64a8,8,0,0,0,0-16Zm0,40H96a8,8,0,0,0,0,16h64a8,8,0,0,0,0-16Zm0,40H96a8,8,0,0,0,0,16h64a8,8,0,0,0,0-16Zm0,40H96a8,8,0,0,0,0,16h64a8,8,0,0,0,0-16Z"></path>
                    </svg>
                </div>

                <!-- 75% - battery-vertical-high -->
                <div v-else-if="node.deviceMetrics.batteryLevel >= 60">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" class="size-5">
                        <path d="M88,8a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H96A8,8,0,0,1,88,8ZM200,56V224a24,24,0,0,1-24,24H80a24,24,0,0,1-24-24V56A24,24,0,0,1,80,32h96A24,24,0,0,1,200,56Zm-16,0a8,8,0,0,0-8-8H80a8,8,0,0,0-8,8V224a8,8,0,0,0,8,8h96a8,8,0,0,0,8-8Zm-24,56H96a8,8,0,0,0,0,16h64a8,8,0,0,0,0-16Zm0,40H96a8,8,0,0,0,0,16h64a8,8,0,0,0,0-16Zm0,40H96a8,8,0,0,0,0,16h64a8,8,0,0,0,0-16Z"></path>
                    </svg>
                </div>

                <!-- 50% - battery-vertical-medium -->
                <div v-else-if="node.deviceMetrics.batteryLevel >= 25">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" class="size-5">
                        <path d="M176,32H80A24,24,0,0,0,56,56V224a24,24,0,0,0,24,24h96a24,24,0,0,0,24-24V56A24,24,0,0,0,176,32Zm8,192a8,8,0,0,1-8,8H80a8,8,0,0,1-8-8V56a8,8,0,0,1,8-8h96a8,8,0,0,1,8,8Zm-16-24a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,200ZM88,8a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H96A8,8,0,0,1,88,8Zm80,152a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,160Z"></path>
                    </svg>
                </div>

                <!-- 25% - battery-vertical-low -->
                <div v-else-if="node.deviceMetrics.batteryLevel >= 10">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" class="size-5">
                        <path d="M88,8a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H96A8,8,0,0,1,88,8ZM200,56V224a24,24,0,0,1-24,24H80a24,24,0,0,1-24-24V56A24,24,0,0,1,80,32h96A24,24,0,0,1,200,56Zm-16,0a8,8,0,0,0-8-8H80a8,8,0,0,0-8,8V224a8,8,0,0,0,8,8h96a8,8,0,0,0,8-8ZM160,192H96a8,8,0,0,0,0,16h64a8,8,0,0,0,0-16Z"></path>
                    </svg>
                </div>

                <!-- 0% - battery-vertical-empty -->
                <div v-else>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 256 256" class="size-5">
                        <path d="M88,8a8,8,0,0,1,8-8h64a8,8,0,0,1,0,16H96A8,8,0,0,1,88,8ZM200,56V224a24,24,0,0,1-24,24H80a24,24,0,0,1-24-24V56A24,24,0,0,1,80,32h96A24,24,0,0,1,200,56Zm-16,0a8,8,0,0,0-8-8H80a8,8,0,0,0-8,8V224a8,8,0,0,0,8,8h96a8,8,0,0,0,8-8Z"></path>
                    </svg>
                </div>

            </div>
        </div>

        <!-- node dropdown menu -->
        <div class="my-auto">
            <NodeDropDownMenu :node="node"/>
        </div>

    </div>
</template>

<script>
import NodeIcon from "./NodeIcon.vue";
import NodeUtils from "../../js/NodeUtils.js";
import NodeDropDownMenu from "./NodeDropDownMenu.vue";
import GlobalState from "../../js/GlobalState.js";
import TimeUtils from "../../js/TimeUtils.js";
import moment from "moment";
import Database from "../../js/Database.js";
import Connection from "../../js/Connection.js";
import IconButton from "../IconButton.vue";
import NodeAPI from "../../js/NodeAPI.js";

export default {
    name: 'NodeListItem',
    components: {
        IconButton,
        NodeDropDownMenu,
        NodeIcon,
    },
    props: {
        node: Object,
    },
    data() {
        return {
            unreadMessagesCount: 0,
            nodeMessagesReadStateSubscription: null,
        };
    },
    mounted() {
        Connection.addMessageListener(this.onMessage);
        this.nodeMessagesReadStateSubscription = Database.NodeMessagesReadState.get(this.node.num).$.subscribe(async (nodeMessagesReadState) => {
            await this.onNodeMessagesReadStateChange(nodeMessagesReadState);
        });
    },
    unmounted() {
        Connection.removeMessageListener(this.onMessage);
        this.nodeMessagesReadStateSubscription?.unsubscribe();
    },
    methods: {
        getNodeLongName: (nodeId) => NodeUtils.getNodeLongName(nodeId),
        formatUnixSecondsAgo(unixSeconds) {

            // check if date is known
            if(unixSeconds > 0){
                return TimeUtils.getTimeAgoShortHand(moment.unix(unixSeconds).toDate());
            }

            return "Unknown";

        },
        async onMessage() {
            const nodeMessagesReadState = await Database.NodeMessagesReadState.get(this.node.num).exec();
            await this.onNodeMessagesReadStateChange(nodeMessagesReadState);
        },
        async updateUnreadMessagesCount(lastReadTimestamp) {
            this.unreadMessagesCount = await Database.Message.getNodeMessagesUnreadCount(this.node.num, lastReadTimestamp).exec();
        },
        async onNodeMessagesReadStateChange(nodeMessagesReadState) {
            const messagesLastReadTimestamp = nodeMessagesReadState?.timestamp ?? 0;
            await this.updateUnreadMessagesCount(messagesLastReadTimestamp);
        },
        async toggleFavouriteNode(node) {

            // determine if the node should now be a favourite
            const isNowFavourite = !node.isFavorite;

            // update in ui
            node.isFavorite = isNowFavourite;

            // update on meshtastic device
            await NodeAPI.setNodeAsFavourite(node.num, isNowFavourite);

        },
    },
    computed: {
        GlobalState() {
            return GlobalState;
        },
    },
}
</script>
