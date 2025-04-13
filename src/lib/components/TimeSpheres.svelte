<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { fade } from 'svelte/transition';
  import { generateTimePeriodId } from '$lib/utils/timeUtils';
  
  export let timeRemaining: any;
  export let viewMode: 'days' | 'weeks' | 'months' | 'years';
  export let sphereNumber: [ 'Day' , 'Week' , 'Month' , 'Year'];
  export let onSphereClick: (id: string) => void;
  
  // Configuration for infinite scroll
  const INITIAL_BATCH = 60;
  const BATCH_SIZE = 40;
  
  let allSpheres: any[] = [];
  let visibleSpheres: any[] = [];
  let isLoading = false;
  let hasMoreSpheres = true;
  let totalCount = 0; // Store the total count for reference
  
  // Initialize spheres when component mounts or when viewMode changes
  $: if (timeRemaining) {
    initializeSpheres();
  }
  
  // Recalculate spheres when viewMode changes
  $: if (viewMode) {
    initializeSpheres();
  }
  
  function initializeSpheres() {
    if (!timeRemaining) return;
    
    totalCount = Math.min(timeRemaining[viewMode], 1000); // Cap at 1000 for performance
    allSpheres = [];
    
    // Calculate the starting count based on age and life expectancy
    let startingCount = 0;
    
    // Calculate the starting count based on viewMode
    if (viewMode === 'years') {
      // If user is 30 years old in a 75-year life expectancy, start from 31
      startingCount = Math.floor(calculateAgeInYears()) + 1;
    } else if (viewMode === 'months') {
      startingCount = Math.floor(calculateAgeInYears() * 12) + 1;
    } else if (viewMode === 'weeks') {
      startingCount = Math.floor(calculateAgeInYears() * 52.143) + 1;
    } else if (viewMode === 'days') {
      startingCount = Math.floor(calculateAgeInYears() * 365.25) + 1;
    }
    
    for (let i = 0; i < totalCount; i++) {
      // Determine if this sphere represents the current time period
      const isCurrentPeriod = i === 0;
      
      allSpheres.push({
        id: `${viewMode}-${i}`,
        isCurrentPeriod,
        periodId: isCurrentPeriod ? generateTimePeriodId(viewMode.slice(0, -1) as any) : '',
        // Count starts from the age-based starting count
        count: startingCount + i
      });
    }
    
    // Reset visible spheres
    visibleSpheres = allSpheres.slice(0, INITIAL_BATCH);
    hasMoreSpheres = visibleSpheres.length < allSpheres.length;
    
    // Reset scroll position when view mode changes
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
  
  // Helper function to calculate age in years
  function calculateAgeInYears() {
    if (!timeRemaining) return 0;
    
    // We need to infer the age based on the remaining time and life expectancy
    // This assumes the timeRemaining object has the expected structure from calculateTimeRemaining
    const effectiveLifeExpectancy = 75; // Default, should match what's used in timeUtils.ts
    const remainingYears = timeRemaining.years;
    
    return effectiveLifeExpectancy - remainingYears;
  }
  
  async function loadMoreSpheres() {
    if (isLoading || !hasMoreSpheres) return;
    
    isLoading = true;
    
    // Small delay to prevent rapid loading
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const currentLength = visibleSpheres.length;
    const nextBatch = allSpheres.slice(currentLength, currentLength + BATCH_SIZE);
    
    if (nextBatch.length > 0) {
      visibleSpheres = [...visibleSpheres, ...nextBatch];
      hasMoreSpheres = visibleSpheres.length < allSpheres.length;
    } else {
      hasMoreSpheres = false;
    }
    
    isLoading = false;
    await tick();
  }
  
  function handleScroll() {
    // Check if we're near the bottom of the page
    const scrollPosition = window.scrollY + window.innerHeight;
    const bottomThreshold = document.body.scrollHeight - 300;
    
    if (scrollPosition > bottomThreshold && !isLoading && hasMoreSpheres) {
      loadMoreSpheres();
    }
  }
  
  function handleSphereClick(sphere: any) {
    if (sphere.isCurrentPeriod) {
      onSphereClick(sphere.periodId);
    }
  }
  
  onMount(() => {
    // Initial load
    if (hasMoreSpheres) {
      loadMoreSpheres();
    }
    
    // Add scroll event listener to the window
    window.addEventListener('scroll', handleScroll);
    
    // Clean up the event listener when component is destroyed
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  });
</script>

<div class="space-y-4">
  <div class="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4 auto-rows-fr">
    {#each visibleSpheres as sphere (sphere.id)}
      <div 
        class="sphere-wrapper aspect-square flex items-center justify-center"
        in:fade={{ duration: 200, delay: Math.random() * 100 }}
      >
        <button
          class="sphere w-full h-full rounded-full transition-all duration-300 hover:shadow-lg flex items-center justify-center relative"
          class:bg-indigo-600={sphere.isCurrentPeriod}
          class:bg-indigo-200={!sphere.isCurrentPeriod}
          class:shadow-md={sphere.isCurrentPeriod}
          on:click={() => handleSphereClick(sphere)}
          title={sphere.isCurrentPeriod ? `Log journal for current ${viewMode.slice(0, -1)}` : `${sphere.count} ${viewMode.slice(0, -1)}s remaining`}
        >
          <!-- Display the remaining count instead of index+1 -->
          <span class={`text-xs ${sphere.isCurrentPeriod ? 'text-white' : 'text-gray-700'} font-medium`}>
            <!-- {#if sphere.count % 10 === 1 && sphere.count % 100 !== 11}
              st
            {:else if sphere.count % 10 === 2 && sphere.count % 100 !== 12}
              nd
            {:else if sphere.count % 10 === 3 && sphere.count % 100 !== 13}
              rd
            {:else}
              th
            {/if} -->
            {#if viewMode === 'years'}
               {sphereNumber[3]}
            {:else if viewMode === 'months'}
               {sphereNumber[2]} 
            {:else if viewMode === 'weeks'}
               {sphereNumber[1]}
            {:else}
               {sphereNumber[0]}
            {/if}
            {sphere.count}

            

          </span>
          
          {#if sphere.isCurrentPeriod}
            <div class="absolute inset-0 rounded-full animate-ping bg-indigo-600/30"></div>
          {/if}
        </button>
      </div>
    {/each}
  </div>
  
  {#if isLoading}
    <div class="flex justify-center py-4">
      <svg class="animate-spin h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
  {/if}
  
  <div class="bg-white bg-opacity-70 backdrop-blur-sm p-2 rounded-lg shadow-sm self-start inline-block">
    <p class="text-xs md:text-sm font-medium text-gray-700">
      Each sphere represents one {viewMode.slice(0, -1)}
    </p>
    <p class="text-xs text-gray-500 hidden md:block">
      Numbers show how many {viewMode} you have left
    </p>
    <p class="text-xs text-gray-500 md:hidden">
      Tap the highlighted sphere to log
    </p>
  </div>
</div>

<style>
  .sphere {
    position: relative;
  }
</style>