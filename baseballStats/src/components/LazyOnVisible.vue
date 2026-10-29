<template>
    <!-- Builds its content only when it scrolls near the screen; keeps the space until then -->
    <div ref="el" :style="visible ? null : { minHeight }">
        <slot v-if="visible" />
    </div>
</template>

<script setup>
import { useVisible } from './composables/useVisible'

defineProps({
    // Space to keep before the content is there, so the page doesn't jump
    minHeight: { type: String, default: '240px' },
})

const { el, visible } = useVisible()
</script>
