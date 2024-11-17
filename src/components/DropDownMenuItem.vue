<template>
    <div class="group flex items-center p-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:outline-none">

        <!-- icon -->
        <div class="mr-2 text-gray-400 group-hover:text-gray-500">
            <slot name="icon"/>
        </div>

        <!-- label -->
        <div>
            <slot name="label"/>
        </div>

    </div>
</template>

<script>
export default {
    name: 'DropDownMenuItem',
}
</script>
