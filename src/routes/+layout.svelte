<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { initAuth, signOut } from '$lib/services/authService';
	import { user, isLoading } from '$lib/stores/authStore';
	import { getProfileImageUrl } from '$lib/firebase/client';
	import { browser } from '$app/environment';

	let { children } = $props();

	onMount(() => {
		if (browser) {
			console.log("Initializing auth from layout");
			initAuth();
			
			// Set a backup timeout to prevent infinite loading
			const backupTimeout = setTimeout(() => {
				if ($isLoading) {
					console.log("Backup timeout reached, forcing isLoading to false");
					isLoading.set(false);
				}
			}, 8000); // 8 seconds backup timeout
			
			return () => clearTimeout(backupTimeout);
		}
	});
	
	// Handle sign out
	async function handleSignOut() {
		try {
			console.log("Signing out...");
			await signOut();
		} catch (error) {
			console.error("Error signing out:", error);
		}
	}
</script>

<div class="min-h-screen bg-gray-100">
	<header class="bg-white shadow">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
			<a href="/" class="text-2xl font-bold text-indigo-600">T-Minus</a>
			
			{#if $isLoading}
				<div class="animate-pulse h-8 w-20 bg-gray-200 rounded"></div>
			{:else if $user}
				<div class="flex items-center space-x-4">
					<a href="/dashboard" class="text-gray-600 hover:text-indigo-600">Dashboard</a>
					<a href="/journal" class="text-gray-600 hover:text-indigo-600">Journal</a>
					<a href="/analysis" class="text-gray-600 hover:text-indigo-600">Analysis</a>
					<div class="relative group">
						<!-- svelte-ignore event_directive_deprecated -->
						<a href="/profile">
							<img 
								src={getProfileImageUrl($user)} 
								alt="Profile" 
								class="h-8 w-8 rounded-full cursor-pointer hover:ring-2 hover:ring-indigo-500"
							/>
						</a>
					</div>
				</div>
			{:else}
				<a 
					href="/login"
					class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
				>
					Sign In
				</a>
			{/if}
		</div>
	</header>

	<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		{@render children()}
	</main>

	<footer class="bg-white border-t border-gray-200 mt-12">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
			<p class="text-center text-gray-500 text-sm">
				&copy; {new Date().getFullYear()} T-Minus. All rights reserved.
			</p>
		</div>
	</footer>
</div>
