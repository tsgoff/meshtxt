<template>
    <div>
        <div class="flex rounded-full h-12 w-12 text-white shadow" :style="{ backgroundColor: getNodeColour(nodeId), color: getNodeTextColour(nodeId)}">
            <div class="mx-auto my-auto drop-shadow-sm">{{ getNodeShortName(nodeId) }}</div>
        </div>
    </div>
</template>

<script>
import NodeUtils from "../../js/NodeUtils.js";

export default {
    name: 'NodeIcon',
    props: {
        nodeId: Number,
    },
    methods: {
        getNodeShortName: (nodeId) => NodeUtils.getNodeShortName(nodeId),
        getNodeColour: (nodeId) => NodeUtils.getNodeColour(nodeId),
        getNodeTextColour: (nodeId) => NodeUtils.getNodeTextColour(nodeId),
    },
}
</script>
