<script lang="ts">
	import { user } from '$lib/stores/authStore';
	import { fade, fly } from 'svelte/transition';
</script>
<div class="absolute inset-0 overflow-hidden">
	<div class="absolute -top-1/4 -left-1/4 w-[150%] h-[150%] bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
	<div class="absolute -bottom-1/4 -right-1/4 w-[150%] h-[150%] bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
	<div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
</div>

<div class="flex-1 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
	<!-- Background gradient elements -->

	<!-- Content -->
	<div class="z-10 max-w-3xl w-full text-center" in:fade={{ duration: 800, delay: 200 }}>
		<h1 class="text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
			<span class="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">T-Minus:</span> 
			<span class="block mt-2">Your Life Countdown</span>
		</h1>
		
		<p class="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
			Visualize your journey, reflect on your experiences, and gain meaningful insights about your life.
		</p>
		
		{#if !$user}
			<div class="flex flex-col items-center space-y-6" in:fly={{ y: 20, duration: 800, delay: 400 }}>
				<a 
					href="/login" 
					class="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-full shadow-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transform transition-all duration-200 hover:scale-105"
				>
					Get Started
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
					</svg>
				</a>
				<p class="text-sm text-gray-500">Sign in securely to begin your journey</p>
			</div>
		{:else}
			<div class="flex flex-col items-center space-y-6" in:fly={{ y: 20, duration: 800, delay: 400 }}>
				<a 
					href="/dashboard" 
					class="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-full shadow-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transform transition-all duration-200 hover:scale-105"
				>
					Go to Dashboard
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
					</svg>
				</a>
			</div>
		{/if}
	</div>
	
	<!-- Feature cards -->
	<div class="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full z-10 px-4">
		<div class="bg-white p-8 rounded-2xl shadow-lg transform transition-all duration-200 hover:-translate-y-2 hover:shadow-xl">
			<div class="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
			</div>
			<h2 class="text-xl font-semibold mb-4 text-gray-900">Track Your Time</h2>
			<p class="text-gray-600">Visualize your remaining time in days, weeks, months, or years with an intuitive interface.</p>
		</div>
		
		<div class="bg-white p-8 rounded-2xl shadow-lg transform transition-all duration-200 hover:-translate-y-2 hover:shadow-xl">
			<div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
				</svg>
			</div>
			<h2 class="text-xl font-semibold mb-4 text-gray-900">Daily Journal</h2>
			<p class="text-gray-600">Log your thoughts and experiences every day to create a meaningful record of your journey.</p>
		</div>
		
		<div class="bg-white p-8 rounded-2xl shadow-lg transform transition-all duration-200 hover:-translate-y-2 hover:shadow-xl">
			<div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
				</svg>
			</div>
			<h2 class="text-xl font-semibold mb-4 text-gray-900">AI Insights</h2>
			<p class="text-gray-600">Get personalized analysis of your journal entries to discover patterns and gain deeper understanding.</p>
		</div>
	</div>
</div>
