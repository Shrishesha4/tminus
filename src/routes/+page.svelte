<script lang="ts">
	import { user } from '$lib/stores/authStore';
</script>

<div class="text-center">
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
		<div class="bg-white p-6 rounded-lg shadow">
			<h2 class="text-xl font-semibold mb-4">Track Your Time</h2>
			<p class="text-gray-600">Visualize your remaining time in days, weeks, months, or years.</p>
		</div>
		<div class="bg-white p-6 rounded-lg shadow">
			<h2 class="text-xl font-semibold mb-4">Daily Journal</h2>
			<p class="text-gray-600">Log your thoughts and experiences every day.</p>
		</div>
		<div class="bg-white p-6 rounded-lg shadow">
			<h2 class="text-xl font-semibold mb-4">AI Insights</h2>
			<p class="text-gray-600">Get personalized analysis of your journal entries.</p>
		</div>
	</div>
</div>
