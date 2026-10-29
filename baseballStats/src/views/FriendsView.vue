<template>
    <main class="page">
        <div class="mb-6">
            <h1 class="text-4xl md:text-5xl font-bold">Friends</h1>
            <p class="text-primary-light mt-1">Find other fans and add them as friends.</p>
        </div>

        <p v-if="actionError" class="alert-error mb-6">{{ actionError }}</p>

        <div class="grid grid-cols-1 lg:grid-cols-[1fr_22rem] gap-6 items-start">
            <!-- Look for other users -->
            <section v-reveal class="card p-5">
                <h2 class="text-2xl font-semibold mb-3">Find people</h2>
                <form class="flex gap-3" @submit.prevent="runSearch">
                    <input
                        v-model="search"
                        type="search"
                        placeholder="Search by name"
                        aria-label="Search users by name"
                        class="input flex-1"
                    />
                    <button type="submit" class="btn-primary" :disabled="searching">Search</button>
                </form>

                <p v-if="searching" class="py-16 text-center text-primary-light">Searching...</p>
                <p v-else-if="searchError" class="alert-error mt-4">{{ searchError }}</p>
                <div v-else-if="!searchedFor" class="py-16 text-center">
                    <p class="text-lg text-primary-light">Search for a name to find other users.</p>
                </div>
                <p v-else-if="!results.length" class="py-16 text-center text-primary-light">
                    Nobody found whose name starts with "{{ searchedFor }}".
                </p>

                <ul v-else class="mt-3">
                    <FriendRow v-for="p in results" :key="p.uid" :person="p">
                        <FriendActions :uid="p.uid" @error="actionError = $event" />
                    </FriendRow>
                </ul>
            </section>

            <div class="flex flex-col gap-6">
                <!-- Friend requests sent to you, and the ones you sent -->
                <section v-reveal="1" class="card p-5">
                    <h2 class="text-2xl font-semibold">
                        Requests
                        <span v-if="incoming.length" class="text-sm font-sans font-normal text-secondary ml-1">{{ incoming.length }}</span>
                    </h2>
                    <p v-if="!loaded" class="py-6 text-center text-sm text-primary-light">Loading...</p>
                    <p v-else-if="!incoming.length && !outgoing.length" class="py-6 text-center text-sm text-primary-light">No friend requests.</p>
                    <template v-else>
                        <ul v-if="incoming.length" class="mt-2">
                            <FriendRow v-for="p in incoming" :key="p.uid" :person="p">
                                <button class="btn-primary h-8! px-3! text-sm" :disabled="busy === p.uid" @click="run(p.uid, accept)">Accept</button>
                                <button class="btn-ghost h-8! px-3! text-sm" :disabled="busy === p.uid" @click="run(p.uid, remove)">Decline</button>
                            </FriendRow>
                        </ul>
                        <template v-if="outgoing.length">
                            <p class="text-xs uppercase tracking-wider text-primary-light mt-4 mb-1">Sent</p>
                            <ul>
                                <FriendRow v-for="p in outgoing" :key="p.uid" :person="p">
                                    <button class="btn-ghost h-8! px-3! text-sm" :disabled="busy === p.uid" @click="run(p.uid, remove)">Cancel</button>
                                </FriendRow>
                            </ul>
                        </template>
                    </template>
                </section>

                <!-- People you are friends with -->
                <section v-reveal="2" class="card p-5">
                    <h2 class="text-2xl font-semibold">
                        Your friends
                        <span v-if="friends.length" class="text-sm font-sans font-normal text-primary-light ml-1">{{ friends.length }}</span>
                    </h2>
                    <p v-if="!loaded" class="py-6 text-center text-sm text-primary-light">Loading...</p>
                    <p v-else-if="!friends.length" class="py-6 text-center text-sm text-primary-light">You haven't added any friends yet.</p>
                    <ul v-else class="mt-2">
                        <FriendRow v-for="p in friends" :key="p.uid" :person="p">
                            <!-- Remove asks once more before it unfriends -->
                            <template v-if="confirming === p.uid">
                                <button class="btn-primary h-8! px-3! text-sm" :disabled="busy === p.uid" @click="run(p.uid, remove)">Remove</button>
                                <button class="btn-ghost h-8! px-3! text-sm" @click="confirming = ''">Keep</button>
                            </template>
                            <button
                                v-else
                                class="w-8 h-8 rounded-md text-primary-light hover:text-white hover:bg-white/10 cursor-pointer"
                                :aria-label="`Remove ${p.displayName}`"
                                @click="confirming = p.uid"
                            >
                                ✕
                            </button>
                        </FriendRow>
                    </ul>
                </section>
            </div>
        </div>
    </main>
</template>

<script setup>
import FriendRow from '@/components/FriendRow.vue'
import FriendActions from '@/components/FriendActions.vue'
import { useFriends } from '@/components/composables/useFriends'
import { useUserSearch } from '@/components/composables/useUserSearch'
import { usePendingAction } from '@/components/composables/usePendingAction'

const { friends, incoming, outgoing, loaded, accept, remove } = useFriends()
const { search, searchedFor, results, searching, error: searchError, runSearch } = useUserSearch()
const { busy, confirming, error: actionError, run } = usePendingAction()
</script>
