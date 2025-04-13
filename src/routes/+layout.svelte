<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { initAuth } from '$lib/services/authService';
	import { user, isLoading } from '$lib/stores/authStore';
	import { getProfileImageUrl } from '$lib/firebase/client';
	import { fade, fly } from 'svelte/transition';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	let { children } = $props();
	
	onMount(() => {
		initAuth();
		
		// Add overflow-hidden to body to prevent scrollbars
		document.body.classList.add('overflow-x-hidden');
		
		// If on the root page, automatically redirect to dashboard
		if ($page.url.pathname === '/') {
			goto('/dashboard');
		}
	});
	
	// Check if current page is a public page (landing, login, or onboarding)
	const isPublicPage = $derived(
		$page.url.pathname === '/' || 
		$page.url.pathname === '/login' || 
		$page.url.pathname === '/onboarding'
	);
</script>

<div class="min-h-screen bg-gray-100 pb-16 md:pb-0 overflow-x-hidden">
	<!-- Desktop header - only show on authenticated pages -->
	{#if !isPublicPage}
		<header class="bg-white shadow hidden md:block">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
				<a href="/" class="text-2xl font-bold text-indigo-600">T-Minus</a>
				
				<!-- Desktop navigation -->
				{#if $isLoading}
					<div class="animate-pulse h-8 w-20 bg-gray-200 rounded"></div>
				{:else if $user}
					<div class="flex items-center space-x-4">
						<a href="/dashboard" class="text-gray-600 hover:text-indigo-600">Dashboard</a>
						<a href="/journal" class="text-gray-600 hover:text-indigo-600">Journal</a>
						<a href="/analysis" class="text-gray-600 hover:text-indigo-600">Analysis</a>
						<a href="/profile" class="text-gray-600 hover:text-indigo-600"><img src={getProfileImageUrl($user)} alt="Profile" class="h-8 w-8 rounded-full" /></a>
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
	{/if}

	<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 overflow-x-hidden">
		{@render children()}
	</main>
	
	<!-- Mobile bottom navigation bar - only show on authenticated pages and when user is logged in -->
	{#if !isPublicPage && !$isLoading && $user}
		<div class="fixed bottom-0 left-0 right-0 md:hidden z-50" transition:fly={{ y: 50, duration: 200 }}>
			<!-- Gradient blur background -->
			<div class="absolute inset-0 bg-white bg-opacity-80 backdrop-blur-md shadow-lg"></div>
			
			<nav class="relative grid grid-cols-4 items-center h-16">
				<a 
					href="/dashboard" 
					class="flex flex-col items-center justify-center h-full"
					class:text-indigo-600={$page.url.pathname === '/dashboard'}
					class:text-gray-500={$page.url.pathname !== '/dashboard'}
				>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
					</svg>
					<span class="text-xs mt-1">Home</span>
				</a>
				
				<!-- Rest of mobile navigation items remain unchanged -->
				{#if !$isLoading && $user}
					<div class="fixed bottom-0 left-0 right-0 md:hidden z-50" transition:fly={{ y: 50, duration: 200 }}>

						<div class="absolute inset-0 bg-white bg-opacity-80 backdrop-blur-md shadow-lg"></div>
						
						<nav class="relative grid grid-cols-4 items-center h-16">
							<a 
								href="/dashboard" 
								class="flex flex-col items-center justify-center h-full"
								class:text-indigo-600={$page.url.pathname === '/dashboard'}
								class:text-gray-500={$page.url.pathname !== '/dashboard'}
							>
								<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
								</svg>
								<span class="text-xs mt-1">Home</span>
							</a>
							
							<a 
								href="/journal" 
								class="flex flex-col items-center justify-center h-full"
								class:text-indigo-600={$page.url.pathname === '/journal'}
								class:text-gray-500={$page.url.pathname !== '/journal'}
							>
								<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
								</svg>
								<span class="text-xs mt-1">Journal</span>
							</a>
							
							<a 
								href="/analysis" 
								class="flex flex-col items-center justify-center h-full"
								class:text-indigo-600={$page.url.pathname === '/analysis'}
								class:text-gray-500={$page.url.pathname !== '/analysis'}
							>
								<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
								</svg>
								<span class="text-xs mt-1">Analysis</span>
							</a>
							
							<a 
								href="/profile" 
								class="flex flex-col items-center justify-center h-full"
								class:text-indigo-600={$page.url.pathname === '/profile'}
								class:text-gray-500={$page.url.pathname !== '/profile'}
							>
								<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
								</svg>
								<span class="text-xs mt-1">Profile</span>
							</a>
						</nav>
					</div>
				{:else if !$isLoading && !$user && $page.url.pathname !== '/login' && $page.url.pathname !== '/onboarding'}
					<div class="fixed bottom-4 right-4 md:hidden z-50">
						<a 
							href="/login"
							class="flex items-center justify-center px-4 py-3 rounded-full shadow-lg bg-indigo-600 text-white"
							transition:fade
						>
							<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
							</svg>
							Sign In
						</a>
					</div>
				{/if}
			</nav>
		</div>
	{:else if !isPublicPage && !$isLoading && !$user}
		<!-- Show login button for non-authenticated users on non-public pages -->
		<div class="fixed bottom-4 right-4 md:hidden z-50">
			<a 
				href="/login"
				class="flex items-center justify-center px-4 py-3 rounded-full shadow-lg bg-indigo-600 text-white"
				transition:fade
			>
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
				</svg>
				Sign In
			</a>
		</div>
	{/if}
</div>
