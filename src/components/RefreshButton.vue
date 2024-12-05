<template>
    <button :disabled="isRefreshing" type="button" class="rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300" :class="[ isRefreshing ? 'cursor-not-allowed' : 'hover:bg-gray-50' ]">
        <span v-if="isRefreshing">Refreshing...</span>
        <span v-else>Refresh</span>
    </button>
</template>
<script>
export default {
    name: "RefreshButton",
    props: {
        isRefreshing: Boolean,
    },
}
</script>