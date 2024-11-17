<template>
    <Page>

        <!-- app bar -->
        <AppBar title="Direct Messages" :subtitle="subtitle">
            <template v-slot:leading>
                <NodeIcon v-if="node" :node="node" class="mr-3"/>
            </template>
            <template v-slot:trailing>
                <NodeDropDownMenu v-if="node" :node="node" @node-deleted="onNodeDeleted"/>
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
import NodeDropDownMenu from "../nodes/NodeDropDownMenu.vue";

export default {
    name: 'NodeMessagesPage',
    components: {
        NodeDropDownMenu,
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
        onNodeDeleted() {

            // go back to main page
            this.$router.push({
                name: "main",
            });

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
