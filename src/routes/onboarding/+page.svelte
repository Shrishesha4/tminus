<script lang="ts">
	import { user } from '$lib/stores/authStore';
	import { saveBirthdate } from '$lib/services/authService';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	
	let birthdate = '';
	let birthTime = '';
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
		
		isLoading = true;
		error = '';
		
		try {
			if ($user) {
				await saveBirthdate($user.uid, birthdate, birthTime);
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

<div class="max-w-md mx-auto bg-white p-8 rounded-lg shadow">
	<h1 class="text-2xl font-bold mb-6">Welcome to T-Minus</h1>
	<p class="text-gray-600 mb-6">To get started, we need to know when you were born.</p>
	
	{#if error}
		<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
			{error}
		</div>
	{/if}
	
	<form on:submit|preventDefault={handleSubmit} class="space-y-4">
		<div>
			<label for="birthdate" class="block text-sm font-medium text-gray-700 mb-1">
				Birthdate (required)
			</label>
			<input
				type="date"
				id="birthdate"
				bind:value={birthdate}
				class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
				required
			/>
		</div>
		
		<div>
			<label for="birthTime" class="block text-sm font-medium text-gray-700 mb-1">
				Birth Time (optional)
			</label>
			<input
				type="time"
				id="birthTime"
				bind:value={birthTime}
				class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
			/>
			<p class="text-xs text-gray-500 mt-1">
				This helps us calculate your remaining time more accurately.
			</p>
		</div>
		
		<button
			type="submit"
			disabled={isLoading}
			class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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