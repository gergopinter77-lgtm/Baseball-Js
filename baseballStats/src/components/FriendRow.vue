<template>
    <!-- One person: picture and name (opens their profile), with buttons on the right -->
    <li class="flex items-center gap-3 py-2.5 border-t border-white/5 first:border-t-0">
        <RouterLink :to="{ name: 'user', params: { id: person.uid } }" class="flex-1 min-w-0 flex items-center gap-3 group">
            <UserAvatar :photo="person.photoURL" :name="person.displayName" class="w-9 h-9 text-sm" />
            <span class="truncate font-medium group-hover:text-secondary">{{ person.displayName }}</span>
        </RouterLink>
        <div class="flex items-center gap-2 shrink-0">
            <slot />
        </div>
    </li>
</template>

<script setup>
import UserAvatar from './UserAvatar.vue'

defineProps({
    // { uid, displayName, photoURL }
    person: { type: Object, required: true },
})
</script>
