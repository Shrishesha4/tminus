<script lang="ts">
	import { onMount } from 'svelte';
	import { user, isLoading } from '$lib/stores/authStore';
	import { goto } from '$app/navigation';
	import { getJournalEntries } from '$lib/services/journalService';
	import { analyzeJournalEntries } from '$lib/services/aiService';
	
	let entries: any[] = [];
	let analysis: any = null;
	let isLoadingData = true;
	let isAnalyzing = false;
	let error = '';
	
	// Add a timeout to prevent infinite loading
	let loadingTimeout: ReturnType<typeof setTimeout>;
	
	onMount(() => {
		// console.log("Analysis mounted, user:", $user?.uid || "null", "isLoading:", $isLoading);
		
		// Set a timeout to prevent infinite loading
		loadingTimeout = setTimeout(() => {
			console.log("Analysis loading timeout reached, forcing state update");
			isLoadingData = false;
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
			
			await loadData();
		})();
		
		// Return the cleanup function directly
		return () => {
			// Clear timeout when component is destroyed
			clearTimeout(loadingTimeout);
		};
	});
	
	async function loadData() {
		isLoadingData = true;
		error = '';
		
		try {
			if ($user) {
				entries = await getJournalEntries($user.uid);
				// You might want to automatically analyze entries here
				// or let the user trigger analysis manually
			}
		} catch (err) {
			error = 'Failed to load your data. Please refresh the page.';
			console.error(err);
		} finally {
			isLoadingData = false;
			clearTimeout(loadingTimeout); // Clear the timeout when data is loaded
		}
	}
	
	async function handleAnalyze() {
		if (entries.length === 0) {
			error = 'You need journal entries to analyze.';
			return;
		}
		
		isAnalyzing = true;
		error = '';
		
		try {
			analysis = await analyzeJournalEntries(entries);
		} catch (err) {
			error = 'Failed to analyze your journal entries. Please try again.';
			console.error(err);
		} finally {
			isAnalyzing = false;
		}
	}
</script>

<div class="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<h1 class="text-3xl font-bold mb-8">Your Analysis</h1>
	
	{#if error}
		<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
			{error}
		</div>
	{/if}
	
	{#if isLoadingData || $isLoading}
		<div class="flex justify-center items-center h-64">
			<svg class="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
				<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
			</svg>
		</div>
	{:else if entries.length === 0}
		<div class="bg-white p-6 rounded-lg shadow mb-8">
			<p class="text-center text-gray-600">You don't have any journal entries yet. Start journaling to get insights.</p>
			<div class="flex justify-center mt-4">
				<a 
					href="/journal" 
					class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
				>
					Go to Journal
				</a>
			</div>
		</div>
	{:else}
		<div class="bg-white p-6 rounded-lg shadow mb-8">
			<h2 class="text-xl font-semibold mb-4">Your Journal Entries</h2>
			<p class="text-gray-600 mb-4">You have {entries.length} journal entries.</p>
			
			<button
				on:click={handleAnalyze}
				disabled={isAnalyzing}
				class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
			>
				{#if isAnalyzing}
					<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
					Analyzing...
				{:else}
					Analyze My Journal
				{/if}
			</button>
		</div>
		
		{#if analysis}
			<div class="bg-white p-6 rounded-lg shadow">
				<h2 class="text-xl font-semibold mb-4">AI Analysis</h2>
				
				<div class="space-y-6">
				<!-- Summary section -->
				<div>
					<h3 class="text-lg font-medium text-gray-900 mb-2">Summary</h3>
					<p class="text-gray-700">{analysis.summary}</p>
				</div>
				
				<!-- Insights section -->
				<div>
					<h3 class="text-lg font-medium text-gray-900 mb-2">Key Insights</h3>
					<ul class="list-disc pl-5 space-y-1">
					{#each analysis.insights || [] as insight}
						<li class="text-gray-700">{insight}</li>
					{/each}
					</ul>
				</div>
				
				<!-- Sentiment section -->
				<div>
					<h3 class="text-lg font-medium text-gray-900 mb-2">Overall Sentiment</h3>
					<div class="flex items-center">
					<span class="px-2.5 py-0.5 rounded-full text-sm font-medium
						{analysis.sentiment === 'positive' ? 'bg-green-100 text-green-800' : 
						analysis.sentiment === 'negative' ? 'bg-red-100 text-red-800' : 
						'bg-gray-100 text-gray-800'}">
						{analysis.sentiment || 'Unknown'}
					</span>
					</div>
				</div>
				</div>
			</div>
			{/if}
	{/if}
</div>