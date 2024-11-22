<template>
    <Page>

        <!-- app bar -->
        <AppBar title="Direct Messages" :subtitle="subtitle">
            <template v-slot:leading>
                <NodeIcon v-if="node" :node-id="node.num" class="mr-3"/>
            </template>
            <template v-slot:trailing>
                <div v-if="node" class="my-auto mr-1">
                    <div v-if="hasPublicKey(node.num)" @click="onPublicKeyInfoClick">
                        <div class="cursor-pointer flex space-x-1 bg-green-50 rounded-md px-2 py-1 text-xs text-green-700 border border-green-700 font-medium">
                            <div>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-4">
                                    <path fill-rule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clip-rule="evenodd" />
                                </svg>
                            </div>
                            <div class="hidden sm:block">Secure Key</div>
                        </div>
                    </div>
                    <div v-else @click="onChannelKeyInfoClick">
                        <div class="cursor-pointer flex space-x-1 bg-gray-50 rounded-md px-2 py-1 text-xs text-gray-700 border border-gray-700 font-medium">
                            <div>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-4">
                                    <path fill-rule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clip-rule="evenodd" />
                                </svg>
                            </div>
                            <div class="hidden sm:block">Channel Key</div>
                        </div>
                    </div>
                </div>
                <NodeDropDownMenu
                    v-if="node"
                    :node="node"
                    :show-delete-message-history-button="true"
                    @node-deleted="onNodeDeleted"/>
            </template>
        </AppBar>

        <!-- list -->
        <div class="flex h-full w-full overflow-hidden">
            <MessageViewer v-if="node != null" type="node" :node-id="node.num"/>
        </div>

    </Page>
</template>

<script>
import GlobalState from "../../js/GlobalState.js";
import AppBar from "../AppBar.vue";
import MessageViewer from "../messages/MessageViewer.vue";
import NodeIcon from "../nodes/NodeIcon.vue";
import Page from "./Page.vue";
import NodeUtils from "../../js/NodeUtils.js";
import NodeDropDownMenu from "../nodes/NodeDropDownMenu.vue";

export default {
    name: 'NodeMessagesPage',
    components: {
        NodeDropDownMenu,
        Page,
        NodeIcon,
        AppBar,
        MessageViewer,
    },
    props: {
        nodeId: String | Number,
    },
    mounted() {

        // redirect to main page if node not found
        if(!this.node){
            this.$router.push({
                name: "main",
            });
            return;
        }

    },
    methods: {
        hasPublicKey: (nodeId) => NodeUtils.hasPublicKey(nodeId),
        getNodeLongName: (nodeId) => NodeUtils.getNodeLongName(nodeId),
        onNodeDeleted() {

            // go back to main page
            this.$router.push({
                name: "main",
            });

        },
        onPublicKeyInfoClick() {
            alert("Direct messages sent to this node are encrypted with this nodes public encryption key and can only be decrypted and read by this node.");
        },
        onChannelKeyInfoClick() {
            alert("Direct messages sent to this node are encrypted with the shared channel key and could be read by anyone else that knows the shared channel key.");
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
