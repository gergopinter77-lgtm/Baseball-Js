<template>
    <div class="relative">
        <input
            v-model="query"
            type="text"
            :placeholder="placeholder"
            class="w-full p-4 text-xl rounded-lg bg-secondary text-white placeholder:text-white/70"
        />

        <ul v-if="isOpen" class="absolute top-full left-0 right-0 z-10 mt-2 rounded-lg overflow-hidden bg-secondary">
            <li v-if="loading && !results.length" class="px-4 py-3">Searching...</li>
            <li v-else-if="error" class="px-4 py-3">{{ error }}</li>
            <li
                v-for="p in results"
                :key="p.id"
                class="px-4 py-3 cursor-pointer hover:bg-secondary-dark"
                @click="pick(p)"
            >
                {{ p.fullName }} – {{ p.primaryPosition?.abbreviation }}
            </li>
        </ul>
    </div>
</template>

<script setup>
import { usePlayerSearch } from './composables/usePlayerSearch'

defineProps({
    placeholder: { type: String, default: 'Search a player...' },
})

const emit = defineEmits(['select'])

const { query, results, loading, error, isOpen, setQueryQuietly } = usePlayerSearch()

function pick(player) {
    setQueryQuietly(player.fullName)
    emit('select', player)
}
</script>