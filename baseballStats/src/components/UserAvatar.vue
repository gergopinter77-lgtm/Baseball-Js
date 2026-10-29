<template>
    <img loading="lazy" decoding="async"
        v-if="photo"
        :src="photo"
        alt=""
        class="rounded-full object-cover shrink-0"
    />
    <span
        v-else
        class="rounded-full bg-secondary-dark text-white flex items-center justify-center font-bold uppercase shrink-0"
    >
        {{ (name || '?')[0] }}
    </span>
</template>

<script setup>
// Shows the profile picture, or the first letter of the name when there is none
defineProps({
    photo: { type: String, default: '' },
    name: { type: String, default: '' },
})
</script>
