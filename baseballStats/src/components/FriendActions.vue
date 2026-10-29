<template>
    <!-- The right friend buttons for how you stand with this person -->
    <span v-if="relation === 'self'" class="text-xs text-primary-light">You</span>

    <template v-else-if="relation === 'friend'">
        <span class="text-sm text-emerald-400">✓ Friends</span>
        <template v-if="allowRemove">
            <!-- Remove asks once more before it unfriends -->
            <template v-if="confirming">
                <button class="btn-primary h-8! px-3! text-sm" :disabled="!!busy" @click="run(uid, remove)">Remove</button>
                <button class="btn-ghost h-8! px-3! text-sm" @click="confirming = ''">Keep</button>
            </template>
            <button v-else class="btn-ghost h-8! px-3! text-sm" @click="confirming = uid">Remove friend</button>
        </template>
    </template>

    <template v-else-if="relation === 'outgoing'">
        <span class="text-sm text-primary-light">Requested</span>
        <button class="btn-ghost h-8! px-3! text-sm" :disabled="!!busy" @click="run(uid, remove)">Cancel</button>
    </template>

    <template v-else-if="relation === 'incoming'">
        <button class="btn-primary h-8! px-3! text-sm" :disabled="!!busy" @click="run(uid, accept)">Accept</button>
        <button class="btn-ghost h-8! px-3! text-sm" :disabled="!!busy" @click="run(uid, remove)">Decline</button>
    </template>

    <button v-else class="btn-primary h-8! px-3! text-sm" :disabled="!!busy" @click="run(uid, sendRequest)">Add friend</button>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useFriends } from './composables/useFriends'
import { usePendingAction } from './composables/usePendingAction'

const props = defineProps({
    uid: { type: String, required: true },
    // Show "Remove friend" when already friends
    allowRemove: { type: Boolean, default: false },
})

const emit = defineEmits(['error'])

const { relationTo, sendRequest, accept, remove } = useFriends()
const relation = computed(() => relationTo(props.uid))
const { busy, confirming, error, run } = usePendingAction()

watch(error, (message) => emit('error', message))
</script>
