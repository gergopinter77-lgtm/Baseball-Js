<template>
    <div class="relative">
        <input
            v-model="query"
            type="text"
            :placeholder="placeholder"
            class="input h-12!"
        />

        <ul v-if="isOpen" class="absolute top-full left-0 right-0 z-10 mt-2 card shadow-2xl overflow-hidden">
            <li v-if="loading && !results.length" class="px-4 py-3 text-primary-light">Searching...</li>
            <li v-else-if="error" class="px-4 py-3 text-secondary">{{ error }}</li>
            <li
                v-for="p in results"
                :key="p.id"
                class="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-white/5"
                @click="pick(p)"
            >
                <img loading="lazy" decoding="async" :src="playerPhotoUrl(p.id, 80)" alt="" class="w-8 aspect-[4/5] rounded-md object-cover bg-white/10" />
                <span class="flex-1">{{ p.fullName }}</span>
                <span class="text-xs font-semibold text-primary-light">{{ p.primaryPosition?.abbreviation }}</span>
            </li>
        </ul>
    </div>
</template>

<script setup>
import { playerPhotoUrl } from '@/api/mlb'
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
