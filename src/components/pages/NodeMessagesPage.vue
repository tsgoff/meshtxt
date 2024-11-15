<template>
    <Page>

        <!-- app bar -->
        <AppBar :title="title" subtitle="Direct Messages">
            <template v-slot:leading>
                <NodeIcon v-if="node" :node="node" class="mr-3"/>
            </template>
            <template v-slot:trailing>
                <IconButton v-if="node" @click="onNodeInfoClick(node)" class="mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                    </svg>
                </IconButton>
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
import IconButton from "../IconButton.vue";
import NodeUtils from "../../js/NodeUtils.js";

export default {
    name: 'NodeMessagesPage',
    components: {
        IconButton,
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
        getNodeLongName: (nodeId) => NodeUtils.getNodeLongName(nodeId),
        onNodeInfoClick(node) {
            this.$router.push({
                name: "node",
                params: {
                    nodeId: node.num,
                },
            });
        },
    },
    computed: {
        node() {
            return GlobalState.nodesById[this.nodeId];
        },
        title() {
            return this.node ? this.getNodeLongName(this.node.num) : "Unknown Node";
        },
    },
}
</script>
