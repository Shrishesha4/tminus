<script lang="ts">
	import { user, isLoading } from '$lib/stores/authStore';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	// Add a timeout to prevent infinite loading
	let loadingTimeout: ReturnType<typeof setTimeout>;
	
	onMount(() => {
		// Set a timeout to prevent infinite loading
		loadingTimeout = setTimeout(() => {
			console.log("Root page loading timeout reached");
		}, 3000); // 3 seconds timeout
		
		// Use an immediately invoked async function for the async operations
		(async () => {
			// Wait a moment for auth to initialize if needed
			await new Promise(resolve => setTimeout(resolve, 500));
			
			// Only redirect if user is logged in
			if ($user && !$isLoading) {
				console.log("User logged in, redirecting to dashboard");
				goto('/dashboard');
			}
		})();
		
		// Return the cleanup function directly
		return () => {
			// Clear timeout when component is destroyed
			clearTimeout(loadingTimeout);
		};
	});
</script>

<!-- Animated gradient background -->
<div class="fixed inset-0 z-0 overflow-hidden">
  <div class="absolute inset-0 bg-gradient-to-br from-blue-500 via-white to-purple-600 animate-gradient-background"></div>
  <div class="absolute inset-0 opacity-30">
    <div class="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
    <div class="absolute top-1/4 -right-1/4 w-1/2 h-1/2 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
    <div class="absolute -bottom-1/4 left-1/4 w-1/2 h-1/2 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
  </div>
</div>

<div class="text-center relative z-10">
	<h1 class="text-4xl font-bold text-gray-900 mb-6">T-Minus: Your Life Countdown</h1>
	<p class="text-xl text-gray-600 mb-8">Track your time, reflect on your journey, gain insights.</p>
	
	{#if !$user}
		<div class="flex flex-col items-center space-y-4">
			<a 
				href="/login" 
				class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
			>
				Get Started
			</a>
			<p class="text-sm text-gray-500">Sign in to begin your journey</p>
		</div>
	{:else}
		<div class="flex flex-col items-center space-y-4">
			<a 
				href="/dashboard" 
				class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
			>
				Go to Dashboard
			</a>
		</div>
	{/if}
	
	<div class="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
		<div class="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow">
			<h2 class="text-xl font-semibold mb-4">Track Your Time</h2>
			<p class="text-gray-600">Visualize your remaining time in days, weeks, months, or years.</p>
		</div>
		<div class="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow">
			<h2 class="text-xl font-semibold mb-4">Daily Journal</h2>
			<p class="text-gray-600">Log your thoughts and experiences every day.</p>
		</div>
		<div class="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow">
			<h2 class="text-xl font-semibold mb-4">AI Insights</h2>
			<p class="text-gray-600">Get personalized analysis of your journal entries.</p>
		</div>
	</div>
</div>
