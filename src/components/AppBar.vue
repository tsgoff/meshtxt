<template>
    <div class="flex bg-gray-100 py-2 border-b">

        <!-- back button -->
        <div class="my-auto">
            <div @click="$router.back()" class="cursor-pointer bg-gray-100 m-1 p-1 rounded-full hover:bg-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
            </div>
        </div>

        <!-- optional: leading -->
        <slot name="leading"/>

        <!-- title and subtitle -->
        <div class="my-auto mr-auto">
            <div class="font-semibold">{{ title }}</div>
            <div v-if="subtitle != null" class="text-sm">{{ subtitle }}</div>
        </div>

        <!-- optional: trailing -->
        <slot name="trailing"/>

    </div>
</template>

<script>
export default {
    name: 'AppBar',
    props: {
        title: String,
        subtitle: String | null,
    },
}
</script>
