<script lang="ts">
	import { user } from '$lib/stores/authStore';
	import { saveBirthdate } from '$lib/services/authService';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	
	let birthdate = '';
	let birthTime = '';
	let lifeExpectancy = 75; // Default value
	let isLoading = false;
	let error = '';
	
	onMount(() => {
		if (!$user) {
			goto('/login');
		}
	});
	
	async function handleSubmit() {
		if (!birthdate) {
			error = 'Please enter your birthdate';
			return;
		}
		
		// Validate life expectancy
		if (lifeExpectancy < 1 || lifeExpectancy > 150) {
			error = 'Life expectancy must be between 1 and 150 years';
			return;
		}
		
		isLoading = true;
		error = '';
		
		try {
			if ($user) {
				await saveBirthdate($user.uid, birthdate, birthTime, lifeExpectancy);
				goto('/dashboard');
			}
		} catch (err) {
			error = 'Failed to save your information. Please try again.';
			console.error(err);
		} finally {
			isLoading = false;
		}
	}
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

<div class="flex-1 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10">
	<div class="z-10 max-w-md w-full" in:fade={{ duration: 800 }}>
		<div class="bg-white/90 backdrop-blur-sm py-10 px-8 shadow-xl rounded-2xl">
			<div class="text-center mb-8">
				<h1 class="text-2xl font-bold text-gray-900 mb-2">Welcome to T-Minus</h1>
				<p class="text-gray-600">Let's set up your profile to get started</p>
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
			
			<form on:submit|preventDefault={handleSubmit} class="space-y-6">
				<div>
					<label for="birthdate" class="block text-sm font-medium text-gray-700 mb-1">
						Birthdate <span class="text-red-500">*</span>
					</label>
					<input
						type="date"
						id="birthdate"
						bind:value={birthdate}
						class="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
						required
					/>
					<p class="text-xs text-gray-500 mt-1">
						This helps us calculate your remaining time
					</p>
				</div>
				
				<div>
					<label for="birthTime" class="block text-sm font-medium text-gray-700 mb-1">
						Birth Time (optional)
					</label>
					<input
						type="time"
						id="birthTime"
						bind:value={birthTime}
						class="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
					/>
					<p class="text-xs text-gray-500 mt-1">
						For more precise calculations
					</p>
				</div>
				
				<div>
					<label for="lifeExpectancy" class="block text-sm font-medium text-gray-700 mb-1">
						Life Expectancy (years)
					</label>
					<p class="text-xs text-gray-500 mt-1 mb-2 font-bold">
						This setting affects how your remaining time is calculated
					</p>
					<div class="flex items-center">
						<input
							type="number"
							id="lifeExpectancy"
							bind:value={lifeExpectancy}
							min="1"
							max="150"
							class="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
						/>
					</div>
					<p class="text-xs text-gray-500 mt-1">
						75 years is the average life expectancy in the World as of {new Date().getFullYear()}
					</p>
				</div>
				
				<button
					type="submit"
					disabled={isLoading}
					class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
				>
					{#if isLoading}
						<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						Saving...
					{:else}
						Continue
					{/if}
				</button>
			</form>
		</div>
	</div>
</div>