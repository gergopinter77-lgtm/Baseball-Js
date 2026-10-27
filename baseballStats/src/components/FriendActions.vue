<template>
    <!-- The right friend buttons for how you stand with this person -->
    <span v-if="relation === 'self'" class="text-xs text-primary-light">You</span>

    <template v-else-if="relation === 'friend'">
        <span class="text-sm text-emerald-400">✓ Friends</span>
        <template v-if="allowRemove">
            <!-- Remove asks once more before it unfriends -->
            <template v-if="confirming">
                <button class="btn-primary h-8! px-3! text-sm" :disabled="busy" @click="run(remove)">Remove</button>
                <button class="btn-ghost h-8! px-3! text-sm" @click="confirming = false">Keep</button>
            </template>
            <button v-else class="btn-ghost h-8! px-3! text-sm" @click="confirming = true">Remove friend</button>
        </template>
    </template>

    <template v-else-if="relation === 'outgoing'">
        <span class="text-sm text-primary-light">Requested</span>
        <button class="btn-ghost h-8! px-3! text-sm" :disabled="busy" @click="run(remove)">Cancel</button>
    </template>

    <template v-else-if="relation === 'incoming'">
        <button class="btn-primary h-8! px-3! text-sm" :disabled="busy" @click="run(accept)">Accept</button>
        <button class="btn-ghost h-8! px-3! text-sm" :disabled="busy" @click="run(remove)">Decline</button>
    </template>

    <button v-else class="btn-primary h-8! px-3! text-sm" :disabled="busy" @click="run(sendRequest)">Add friend</button>
</template>

<script setup>
import { ref, computed } from 'vue'
import { friendlyError } from './composables/useAuth'
import { useFriends } from './composables/useFriends'

const props = defineProps({
    uid: { type: String, required: true },
    // Show a "Remove friend" button when you're already friends
    allowRemove: { type: Boolean, default: false },
})

const emit = defineEmits(['error'])

const { relationTo, sendRequest, accept, remove } = useFriends()
const relation = computed(() => relationTo(props.uid))

const busy = ref(false)
const confirming = ref(false)

async function run(action) {
    busy.value = true
    emit('error', '')
    try {
        await action(props.uid)
        confirming.value = false
    } catch (e) {
        emit('error', friendlyError(e))
    } finally {
        busy.value = false
    }
}
</script>
