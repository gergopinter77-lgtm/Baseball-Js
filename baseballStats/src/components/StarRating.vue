<template>
    <!-- 1-5 stars. Readonly shows a rating (halves rounded), otherwise click a star to pick it. -->
    <span
        class="inline-flex items-center"
        :role="readonly ? 'img' : 'radiogroup'"
        :aria-label="readonly ? `${modelValue.toFixed(1)} out of 5 stars` : 'Rating'"
        @mouseleave="hover = 0"
    >
        <template v-for="n in 5" :key="n">
            <span v-if="readonly" aria-hidden="true" :class="[sizeClass, starClass(n)]">★</span>
            <button
                v-else
                type="button"
                role="radio"
                :aria-checked="modelValue === n"
                :aria-label="`${n} ${n === 1 ? 'star' : 'stars'}`"
                class="cursor-pointer px-0.5 transition-colors"
                :class="[sizeClass, starClass(n)]"
                @mouseenter="hover = n"
                @click="$emit('update:modelValue', n)"
            >
                ★
            </button>
        </template>
    </span>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
    modelValue: { type: Number, default: 0 },
    readonly: { type: Boolean, default: false },
    size: { type: String, default: 'md' },
})

defineEmits(['update:modelValue'])

const hover = ref(0)
const sizeClass = computed(() => ({ sm: 'text-sm', md: 'text-xl', lg: 'text-2xl' })[props.size])

// While hovering, show the stars up to the mouse; otherwise the rating (rounded to the nearest star)
function starClass(n) {
    const shown = hover.value || Math.round(props.modelValue)
    return n <= shown ? 'text-yellow-300' : 'text-white/20'
}
</script>
