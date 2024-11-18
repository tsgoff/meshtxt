<template>
    <div class="w-full">
        <RouterView v-slot="{ Component, route }">
            <KeepAlive>
                <Component :is="Component" :key="route.fullPath" />
            </KeepAlive>
        </RouterView>
    </div>
</template>

<script>
export default {
    name: 'App',
}
</script>
