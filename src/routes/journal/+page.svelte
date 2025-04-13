<script lang="ts">
	import { onMount } from 'svelte';
	import { user, isLoading } from '$lib/stores/authStore';
	import { addJournalEntry, getJournalEntries } from '$lib/services/journalService';
	
	let entries: any[] = [];
	let filteredEntries: any[] = [];
	let isLoadingEntries = true;
	let isSaving = false;
	let error = '';
	let newEntry = '';
	let searchQuery = '';
	let sortOption = 'newest'; // Default sort option
	
	// Add a timeout to prevent infinite loading
	let loadingTimeout: ReturnType<typeof setTimeout>;
	
	onMount(() => {
		// Set a timeout to prevent infinite loading
		loadingTimeout = setTimeout(() => {
			isLoadingEntries = false;
			error = "Loading took too long. Please refresh the page.";
		}, 5000); // 5 seconds timeout
		
		if (!$isLoading && $user) {
			loadEntries();
		}
		
		return () => {
			clearTimeout(loadingTimeout);
		};
	});
	
	// Watch for user auth state changes
	$: if (!$isLoading && $user && entries.length === 0) {
		loadEntries();
	}
	
	// Filter and sort entries when search query or sort option changes
	$: {
		if (entries.length > 0) {
			// First filter by search query
			if (searchQuery.trim() === '') {
				filteredEntries = [...entries];
			} else {
				const query = searchQuery.toLowerCase();
				filteredEntries = entries.filter(entry => 
					entry.content.toLowerCase().includes(query)
				);
			}
			
			// Then sort the filtered entries
			switch (sortOption) {
				case 'newest':
					filteredEntries.sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime());
					break;
				case 'oldest':
					filteredEntries.sort((a, b) => a.createdAt.toDate().getTime() - b.createdAt.toDate().getTime());
					break;
				case 'longest':
					filteredEntries.sort((a, b) => b.content.length - a.content.length);
					break;
				case 'shortest':
					filteredEntries.sort((a, b) => a.content.length - b.content.length);
					break;
			}
		} else {
			filteredEntries = [];
		}
	}
	
	async function loadEntries() {
		isLoadingEntries = true;
		error = '';
		
		try {
			if ($user) {
				entries = await getJournalEntries($user.uid);
				// Initialize filtered entries
				filteredEntries = [...entries];
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
	
	function formatDate(date: Date) {
		return new Intl.DateTimeFormat('en-US', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: 'numeric',
			minute: 'numeric'
		}).format(date);
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
					on:keydown={(e) => {
						// Submit on Cmd+Enter (Mac) or Ctrl+Enter (Windows/Linux)
						if ((e.key === 'Enter' || e.key === 'Return') && (e.metaKey || e.ctrlKey)) {
							if (newEntry.trim()) {
								e.preventDefault();
								handleSubmit();
							}
						}
					}}
				></textarea>
			</div>
			<div class="flex justify-end">
				<button
					type="submit"
					disabled={isSaving || !newEntry.trim()}
					class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{#if isSaving}
						<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						Saving...
					{:else}
						Save Entry
					{/if}
				</button>
			</div>
		</form>
	</div>
	
	<div class="bg-white p-6 rounded-lg shadow">
		<div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
			<h2 class="text-xl font-semibold mb-4 md:mb-0">Your Entries</h2>
			
			<div class="w-full md:w-auto flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
				<!-- Search input -->
				<div class="relative">
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Search entries..."
						class="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
					/>
					{#if searchQuery}
						<button 
							class="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
							on:click={() => searchQuery = ''}
							aria-label="Clear search"
						>
							<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
								<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
							</svg>
						</button>
					{/if}
				</div>
				
				<!-- Sort dropdown with improved styling -->
				<div class="relative inline-block w-full md:w-auto">
					<select
						bind:value={sortOption}
						class="appearance-none w-full bg-white border border-gray-300 rounded-md pl-3 pr-8 py-2 text-sm text-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
					>
						<option value="newest">Newest First</option>
						<option value="oldest">Oldest First</option>
						<option value="longest">Longest First</option>
						<option value="shortest">Shortest First</option>
					</select>
					<!-- svelte-ignore element_invalid_self_closing_tag -->
					<div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700"/>
				</div>
			</div>
		</div>
		
		{#if isLoadingEntries || $isLoading}
			<div class="flex justify-center items-center h-32">
				<svg class="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
					<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
				</svg>
			</div>
		{:else if filteredEntries.length === 0}
			<div class="text-center py-8 text-gray-500">
				{#if searchQuery && entries.length > 0}
					<p>No entries match your search.</p>
					<button 
						class="mt-2 text-indigo-600 hover:text-indigo-800"
						on:click={() => searchQuery = ''}
					>
						Clear search
					</button>
				{:else}
					<p>You haven't added any journal entries yet.</p>
					<p class="mt-2">Start journaling to track your thoughts and get AI insights.</p>
				{/if}
			</div>
		{:else}
			<!-- Show search results count if searching -->
			{#if searchQuery}
				<div class="mb-4 text-sm text-gray-600">
					Found {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'} matching "{searchQuery}"
				</div>
			{/if}
			
			<div class="space-y-6">
				{#each filteredEntries as entry}
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