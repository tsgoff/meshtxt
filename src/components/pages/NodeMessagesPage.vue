<template>
    <Page>

        <!-- app bar -->
        <AppBar :title="title" subtitle="Direct Messages">
            <template v-slot:leading>
                <NodeIcon v-if="node" :node="node" class="mr-3"/>
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

export default {
    name: 'NodeMessagesPage',
    components: {
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
    computed: {
        node() {
            return GlobalState.nodesById[this.nodeId];
        },
        title() {
            return this.node?.user?.longName || 'Unknown Node';
        },
    },
}
</script>
