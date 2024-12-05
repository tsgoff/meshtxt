<template>
    <button :disabled="isRefreshing" type="button" class="rounded bg-white px-2 py-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300" :class="[ isRefreshing ? 'cursor-not-allowed' : 'hover:bg-gray-50' ]">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5" :class="{ 'animate-spin': isRefreshing }">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
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