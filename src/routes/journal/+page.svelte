<script lang="ts">
	import { onMount } from 'svelte';
	import { user, isLoading } from '$lib/stores/authStore';
	import { goto } from '$app/navigation';
	import { addJournalEntry, getJournalEntries } from '$lib/services/journalService';
	import { formatDate } from '$lib/utils/timeUtils';
	
	let entries: any[] = [];
	let newEntry = '';
	let isLoadingEntries = true;
	let isSaving = false;
	let error = '';
	
	// Add a timeout to prevent infinite loading
	let loadingTimeout: ReturnType<typeof setTimeout>;
	
	onMount(() => {
		console.log("Journal mounted, user:", $user?.uid || "null", "isLoading:", $isLoading);
		
		// Set a timeout to prevent infinite loading
		loadingTimeout = setTimeout(() => {
			console.log("Journal loading timeout reached, forcing state update");
			isLoadingEntries = false;
			error = "Loading took too long. Please refresh the page.";
		}, 5000); // 5 seconds timeout
		
		// Use an immediately invoked async function for the async operations
		(async () => {
			// Wait a moment for auth to initialize if it hasn't already
			if ($isLoading) {
				console.log("Waiting for auth to initialize...");
				await new Promise(resolve => setTimeout(resolve, 1000));
			}
			
			if (!$user) {
				console.log("No user found, redirecting to login");
				goto('/login');
				return;
			}
			
			await loadEntries();
		})();
		
		// Return the cleanup function directly
		return () => {
			// Clear timeout when component is destroyed
			clearTimeout(loadingTimeout);
		};
	});
	
	async function loadEntries() {
		isLoadingEntries = true;
		error = '';
		
		try {
			if ($user) {
				entries = await getJournalEntries($user.uid);
			}
		} catch (err) {
			error = 'Failed to load your journal entries. Please refresh the page.';
			console.error(err);
		} finally {
			isLoadingEntries = false;
			clearTimeout(loadingTimeout); // Clear the timeout when data is loaded
		}
	}
	
	async function handleSubmit() {
		if (!newEntry.trim()) {
			return;
		}
		
		isSaving = true;
		error = '';
		
		try {
			if ($user) {
				await addJournalEntry($user.uid, newEntry);
				newEntry = '';
				await loadEntries();
			}
		} catch (err) {
			error = 'Failed to save your journal entry. Please try again.';
			console.error(err);
		} finally {
			isSaving = false;
		}
	}
</script>

<div>
	<h1 class="text-3xl font-bold mb-8">Your Journal</h1>
	
	{#if error}
		<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
			{error}
		</div>
	{/if}
	
	<div class="bg-white p-6 rounded-lg shadow mb-8">
		<h2 class="text-xl font-semibold mb-4">Add New Entry</h2>
		<form on:submit|preventDefault={handleSubmit} class="space-y-4">
			<div>
				<label for="entry" class="block text-sm font-medium text-gray-700 mb-1">
					What's on your mind today?
				</label>
				<textarea
					id="entry"
					bind:value={newEntry}
					rows="4"
					class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
					placeholder="Write your thoughts here..."
				></textarea>
				<p class="text-xs text-gray-500 mt-1">
					Journal entries cannot be edited after submission.
				</p>
			</div>
			
			<button
				type="submit"
				disabled={isSaving || !newEntry.trim()}
				class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
			>
				{#if isSaving}
					<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
					Saving...
				{:else}
					Save Entry
				{/if}
			</button>
		</form>
	</div>
	
	<div class="bg-white p-6 rounded-lg shadow">
		<h2 class="text-xl font-semibold mb-4">Your Journal Entries</h2>
		
		{#if isLoadingEntries}
			<div class="flex justify-center items-center h-32">
				<svg class="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
					<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
				</svg>
			</div>
		{:else if entries.length === 0}
			<div class="text-center py-8 text-gray-500">
				<p>You haven't added any journal entries yet.</p>
				<p class="mt-2">Start journaling to track your thoughts and get AI insights.</p>
			</div>
		{:else}
			<div class="space-y-6">
				{#each entries as entry}
					<div class="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
						<div class="flex justify-between items-start mb-2">
							<span class="text-sm text-gray-500">
								{formatDate(entry.createdAt.toDate())}
							</span>
						</div>
						<p class="text-gray-800 whitespace-pre-line">{entry.content}</p>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>