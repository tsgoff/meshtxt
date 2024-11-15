<template>
    <div class="w-full">
        <RouterView v-slot="{ Component }">
            <KeepAlive>
                <Component :is="Component" />
            </KeepAlive>
        </RouterView>
    </div>
</template>

<script>
export default {
    name: 'App',
}
</script>
