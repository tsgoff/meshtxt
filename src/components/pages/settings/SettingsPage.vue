<template>
    <Page>

        <!-- app bar -->
        <AppBar title="Settings" :subtitle="subtitle">
            <template v-slot:leading>
                <NodeIcon v-if="node" :node-id="node.num" class="mr-3"/>
            </template>
        </AppBar>

        <!-- settings list -->
        <SettingsList v-if="node" :node-id="node.num"/>

    </Page>
</template>

<script>
import Page from "../Page.vue";
import AppBar from "../../AppBar.vue";
import GlobalState from "../../../js/GlobalState.js";
import NodeUtils from "../../../js/NodeUtils.js";
import SettingsList from "./SettingsList.vue";
import NodeIcon from "../../nodes/NodeIcon.vue";

export default {
    name: 'UserSettingsPage',
    components: {
        NodeIcon,
        Page,
        AppBar,
        SettingsList,
    },
    props: {
        nodeId: String | Number,
    },
    methods: {
        getNodeLongName: (nodeId) => NodeUtils.getNodeLongName(nodeId),
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
