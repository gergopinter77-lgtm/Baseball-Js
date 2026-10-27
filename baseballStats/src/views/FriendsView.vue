<template>
    <main class="page">
        <div class="mb-6">
            <h1 class="text-4xl md:text-5xl font-bold">Friends</h1>
            <p class="text-primary-light mt-1">Find other fans and add them as friends.</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-[1fr_22rem] gap-6 items-start">
            <!-- Look for other users -->
            <section class="card p-5">
                <h2 class="text-2xl font-semibold mb-3">Find people</h2>
                <form class="flex gap-3" @submit.prevent>
                    <input
                        v-model="search"
                        type="search"
                        placeholder="Search by name"
                        aria-label="Search users by name"
                        class="input flex-1"
                    />
                    <button type="submit" class="btn-primary">Search</button>
                </form>

                <!-- Search results will be listed here -->
                <div class="py-16 text-center">
                    <p class="text-lg text-primary-light">Search for a name to find other users.</p>
                </div>
            </section>

            <div class="flex flex-col gap-6">
                <!-- Friend requests sent to you -->
                <section class="card p-5">
                    <h2 class="text-2xl font-semibold">Requests</h2>
                    <p class="py-6 text-center text-sm text-primary-light">No friend requests.</p>
                </section>

                <!-- People you are friends with -->
                <section class="card p-5">
                    <h2 class="text-2xl font-semibold">Your friends</h2>
                    <p class="py-6 text-center text-sm text-primary-light">You haven't added any friends yet.</p>
                </section>
            </div>
        </div>
    </main>
</template>

<script setup>
import { ref } from 'vue'

const search = ref('')
</script>
