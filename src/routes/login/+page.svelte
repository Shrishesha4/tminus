<script lang="ts">
	import { signInWithGoogle } from '$lib/services/authService';
	import { user } from '$lib/stores/authStore';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	
	let isLoading = false;
	let error = '';
	
	// Add a timeout to prevent infinite loading
	let loadingTimeout: ReturnType<typeof setTimeout>;
	
	onMount(() => {
		console.log("Login mounted, user:", $user?.uid || "null");
		
		// Set a timeout to prevent infinite loading
		loadingTimeout = setTimeout(() => {
			console.log("Login loading timeout reached");
		}, 5000); // 5 seconds timeout
		
		// Use an immediately invoked async function for the async operations
		(async () => {
			// Wait a moment for auth to initialize if needed
			await new Promise(resolve => setTimeout(resolve, 500));
			
			if ($user) {
				console.log("User already logged in, redirecting to dashboard");
				goto('/dashboard');
			}
		})();
		
		// Return the cleanup function directly
		return () => {
			// Clear timeout when component is destroyed
			clearTimeout(loadingTimeout);
		};
	});
	
	async function handleGoogleSignIn() {
		isLoading = true;
		error = '';
		
		try {
			await signInWithGoogle();
		} catch (err) {
			error = 'Failed to sign in with Google. Please try again.';
			console.error(err);
		} finally {
			isLoading = false;
		}
	}
</script>

<!-- Background gradient elements -->
<div class="absolute inset-0 overflow-hidden">
	<div class="absolute -top-1/4 -left-1/4 w-[150%] h-[150%] bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
	<div class="absolute -bottom-1/4 -right-1/4 w-[150%] h-[150%] bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
</div>
<div class="flex-1 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">

	<div class="z-10 max-w-md w-full" in:fade={{ duration: 800 }}>
		<div class="bg-white py-10 px-8 shadow-xl rounded-2xl">
			<div class="text-center mb-8">
				<h1 class="text-3xl font-bold text-gray-900 mb-2">Welcome to T-Minus</h1>
				<p class="text-gray-600">Sign in to track your journey</p>
			</div>
			
			{#if error}
				<div class="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md" in:fly={{ y: 10, duration: 300 }}>
					<div class="flex">
						<div class="flex-shrink-0">
							<svg class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
								<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
							</svg>
						</div>
						<div class="ml-3">
							<p class="text-sm text-red-700">{error}</p>
						</div>
					</div>
				</div>
			{/if}
			
			<button
				on:click={handleGoogleSignIn}
				disabled={isLoading}
				class="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-[1.02]"
			>
				{#if isLoading}
					<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
					Signing in...
				{:else}
					<svg class="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
						<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
						<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
						<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
					</svg>
					Sign in with Google
				{/if}
			</button>
			
			<div class="mt-8 text-center">
				<p class="text-sm text-gray-600">
					By signing in, you agree to our <a href="/terms" class="text-indigo-600 hover:text-indigo-800">Terms of Service</a> and <a href="/privacy" class="text-indigo-600 hover:text-indigo-800">Privacy Policy</a>.
				</p>
			</div>
		</div>
		
		<div class="text-center mt-6">
			<a href="/" class="text-sm text-indigo-600 hover:text-indigo-800 flex items-center justify-center">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
				</svg>
				Back to home
			</a>
		</div>
	</div>
</div>