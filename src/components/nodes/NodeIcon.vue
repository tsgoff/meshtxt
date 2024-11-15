<template>
    <div class="flex rounded-full h-12 w-12 text-white shadow" :style="{ backgroundColor: getNodeColour(node.num), color: getNodeTextColour(node.num)}">
        <div class="mx-auto my-auto drop-shadow-sm">{{ node.user.shortName }}</div>
    </div>
</template>

<script>
import NodeUtils from "../../js/NodeUtils.js";

export default {
    name: 'NodeIcon',
    props: {
        node: Object,
    },
    methods: {
        getNodeColour: (nodeId) => NodeUtils.getNodeColour(nodeId),
        getNodeTextColour: (nodeId) => NodeUtils.getNodeTextColour(nodeId),
    },
}
</script>
