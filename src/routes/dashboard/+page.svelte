<script lang="ts">
	import { onMount } from 'svelte';
	import { user, isLoading } from '$lib/stores/authStore';
	import { goto } from '$app/navigation';
	import { calculateTimeRemaining } from '$lib/utils/timeUtils';
	import { db } from '$lib/firebase/client';
	import { doc, getDoc } from 'firebase/firestore';
	import TimeSpheres from '$lib/components/TimeSpheres.svelte';
	import JournalModal from '$lib/components/JournalModal.svelte';
	
	let userData: any = null;
	let timeRemaining: any = null;
	let viewMode = 'months';
	const sphereNumber: ["Day", "Week", "Month", "Year"] = ["Day", "Week", "Month", "Year"];
	let isLoadingData = true;
	let error = '';
	let showJournalModal = false;
	let selectedPeriodId = '';
	let selectedPeriodType: 'day' | 'week' | 'month' | 'year' = 'day';
	
	// Add a timeout to prevent infinite loading
	let loadingTimeout: ReturnType<typeof setTimeout>;
	
	// Update the loadData function to pass the life expectancy to calculateTimeRemaining
	onMount(() => {
		// console.log("Dashboard mounted, user:", $user?.uid || "null", "isLoading:", $isLoading);
		
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
				// console.log("Loading user data for:", $user.uid);
				const userDoc = await getDoc(doc(db, 'users', $user.uid));
				
				if (userDoc.exists()) {
					userData = userDoc.data();
					console.log("User data loaded:", userData);
					// Pass the custom life expectancy to the calculation
					timeRemaining = calculateTimeRemaining(
						userData.birthdate, 
						userData.birthTime, 
						userData.lifeExpectancy
					);
				} else {
					console.log("No user document, redirecting to onboarding");
					goto('/onboarding');
				}
			} catch (err) {
				console.error("Error loading user data:", err);
				error = 'Failed to load your data. Please refresh the page.';
			} finally {
				// console.log("Setting isLoadingData to false");
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
	
	function handleSphereClick(periodId: string) {
		selectedPeriodId = periodId;
		selectedPeriodType = periodId.split('-')[0] as any;
		showJournalModal = true;
	}
	
	function closeJournalModal() {
		showJournalModal = false;
	}
</script>

<div class="max-w-6xl mx-auto px-2 md:px-4 md:py-8 mb-16 md:mb-0">
  <h1 class="text-2xl md:text-3xl font-bold mb-4 md:mb-8 text-gray-800 ">T-Minus Your Life</h1>
  
  {#if error}
    <div class="bg-red-100 border border-red-400 text-red-700 px-3 py-2 text-sm md:text-base rounded-lg mb-4 md:mb-6 shadow-sm">
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
    <!-- Quick access cards - hidden on mobile, visible on md screens and up -->
    <div class="hidden md:grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
      <div class="bg-white p-4 md:p-6 rounded-xl shadow-md transition-transform hover:scale-[1.02] duration-300">
        <div class="flex items-start mb-4">
          <div class="bg-indigo-100 p-2 md:p-3 rounded-lg mr-3 md:mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 md:h-6 md:w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <div>
            <h2 class="text-lg md:text-xl font-semibold text-gray-800">Journal Entries</h2>
            <p class="text-gray-600 mt-1 text-sm md:text-base">View and manage your past journal entries</p>
          </div>
        </div>
        <a 
          href="/journal" 
          class="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
        >
          View Journal
        </a>
      </div>
      
      <div class="bg-white p-4 md:p-6 rounded-xl shadow-md transition-transform hover:scale-[1.02] duration-300">
        <div class="flex items-start mb-4">
          <div class="bg-indigo-100 p-2 md:p-3 rounded-lg mr-3 md:mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 md:h-6 md:w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h2 class="text-lg md:text-xl font-semibold text-gray-800">AI Analysis</h2>
            <p class="text-gray-600 mt-1 text-sm md:text-base">Get AI-powered insights from your journal entries</p>
          </div>
        </div>
        <a 
          href="/analysis" 
          class="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
        >
          View Analysis
        </a>
      </div>
    </div>
    
    <!-- Time remaining section -->
    <div class="mt-4 md:mt-10 mb-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 class="hidden md:block text-xl md:text-2xl font-semibold text-gray-800 mb-4 md:mb-0">Time Remaining</h2>
        <div class="flex flex-wrap gap-2 w-full md:w-auto">
			<button 
            class={`px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium transition-colors ${viewMode === 'days' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            on:click={() => viewMode = 'days'}
          >
            Days
          </button>
		  <button 
		  class={`px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium transition-colors ${viewMode === 'weeks' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
		  on:click={() => viewMode = 'weeks'}
		>
		  Weeks
		</button>
          <button 
            class={`px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium transition-colors ${viewMode === 'months' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            on:click={() => viewMode = 'months'}
          >
            Months
          </button>
		  <button 
		  class={`px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium transition-colors ${viewMode === 'years' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
		  on:click={() => viewMode = 'years'}
		>
		  Years
		</button>
        </div>
      </div>
      
      <div class="text-center mb-6">
        <div class="text-4xl md:text-6xl font-bold text-indigo-600 mb-2">
          {timeRemaining[viewMode].toLocaleString()}
        </div>
        <p class="text-gray-600 text-base md:text-lg">{viewMode} remaining</p>
      </div>
    </div>
    
    <!-- TimeSpheres component directly in the page -->
    <div class="mt-4">
      <TimeSpheres 
        {timeRemaining} 
        viewMode={viewMode as "years" | "months" | "weeks" | "days"}
        {sphereNumber}
        onSphereClick={handleSphereClick} 
      />
    </div>
  {/if}
  
  {#if showJournalModal}
    <JournalModal 
      periodId={selectedPeriodId} 
      periodType={selectedPeriodType} 
      onClose={closeJournalModal} 
    />
  {/if}
</div>