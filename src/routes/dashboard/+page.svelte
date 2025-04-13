<script lang="ts">
	import { onMount } from 'svelte';
	import { user, isLoading } from '$lib/stores/authStore';
	import { goto } from '$app/navigation';
	import { calculateTimeRemaining } from '$lib/utils/timeUtils';
	import { db } from '$lib/firebase/client';
	import { doc, getDoc } from 'firebase/firestore';
	
	let userData: any = null;
	let timeRemaining: any = null;
	let viewMode = 'years';
	let isLoadingData = true;
	let error = '';
	
	// Add a timeout to prevent infinite loading
	let loadingTimeout: ReturnType<typeof setTimeout>;
	
	onMount(() => {
		console.log("Dashboard mounted, user:", $user?.uid || "null", "isLoading:", $isLoading);
		
		// Set a timeout to prevent infinite loading
		loadingTimeout = setTimeout(() => {
			console.log("Dashboard loading timeout reached, forcing state update");
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
			
			try {
				console.log("Loading user data for:", $user.uid);
				const userDoc = await getDoc(doc(db, 'users', $user.uid));
				
				if (userDoc.exists()) {
					userData = userDoc.data();
					console.log("User data loaded:", userData);
					timeRemaining = calculateTimeRemaining(userData.birthdate, userData.birthTime);
				} else {
					console.log("No user document, redirecting to onboarding");
					goto('/onboarding');
				}
			} catch (err) {
				console.error("Error loading user data:", err);
				error = 'Failed to load your data. Please refresh the page.';
			} finally {
				console.log("Setting isLoadingData to false");
				isLoadingData = false;
				clearTimeout(loadingTimeout); // Clear the timeout when data is loaded
			}
		})();
		
		// Return the cleanup function directly
		return () => {
			// Clear timeout when component is destroyed
			clearTimeout(loadingTimeout);
		};
	});
</script>

<div>
	<h1 class="text-3xl font-bold mb-8">Your Life Countdown</h1>
	
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
	{:else if userData && timeRemaining}
		<div class="bg-white p-6 rounded-lg shadow mb-8">
			<div class="flex justify-between items-center mb-6">
				<h2 class="text-xl font-semibold">Time Remaining</h2>
				<div class="flex space-x-2">
					<button 
						class={`px-3 py-1 rounded text-sm ${viewMode === 'years' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
						on:click={() => viewMode = 'years'}
					>
						Years
					</button>
					<button 
						class={`px-3 py-1 rounded text-sm ${viewMode === 'months' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
						on:click={() => viewMode = 'months'}
					>
						Months
					</button>
					<button 
						class={`px-3 py-1 rounded text-sm ${viewMode === 'weeks' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
						on:click={() => viewMode = 'weeks'}
					>
						Weeks
					</button>
					<button 
						class={`px-3 py-1 rounded text-sm ${viewMode === 'days' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
						on:click={() => viewMode = 'days'}
					>
						Days
					</button>
				</div>
			</div>
			
			<div class="text-center">
				<div class="text-6xl font-bold text-indigo-600 mb-2">
					{timeRemaining[viewMode].toLocaleString()}
				</div>
				<p class="text-gray-600">{viewMode} remaining</p>
			</div>
		</div>
		
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<div class="bg-white p-6 rounded-lg shadow">
				<h2 class="text-xl font-semibold mb-4">Quick Journal</h2>
				<p class="text-gray-600 mb-4">Record your thoughts for today.</p>
				<a 
					href="/journal" 
					class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
				>
					Go to Journal
				</a>
			</div>
			
			<div class="bg-white p-6 rounded-lg shadow">
				<h2 class="text-xl font-semibold mb-4">AI Analysis</h2>
				<p class="text-gray-600 mb-4">Get insights from your journal entries.</p>
				<a 
					href="/analysis" 
					class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
				>
					View Analysis
				</a>
			</div>
		</div>
	{/if}
</div>