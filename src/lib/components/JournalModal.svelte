<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { addJournalEntry, getJournalEntries } from '$lib/services/journalService';
  import { user } from '$lib/stores/authStore';
  import { onMount } from 'svelte';
  
  export let periodId: string = '';
  export let periodType: 'day' | 'week' | 'month' | 'year' = 'day';
  export let onClose: () => void;
  
  let content = '';
  let existingEntry: any = null;
  let isLoading = true;
  let isSaving = false;
  let error = '';
  let success = '';
  let needsIndex = false;
  
  // Get current time with seconds precision
  const now = new Date();
  const currentTime = {
    hours: now.getHours(),
    minutes: now.getMinutes(),
    seconds: now.getSeconds()
  };
  
  $: periodTitle = getPeriodTitle(periodType, periodId);
  
  onMount(async () => {
    if ($user) {
      try {
        isLoading = true;
        // Try to load existing entry for this period
        const entries = await getJournalEntries($user.uid, periodId);
        if (entries.length > 0) {
          existingEntry = entries[0];
          content = existingEntry.content;
        }
      } catch (err) {
        console.error('Error loading journal entry:', err);
        
        // Check if this is an index error
        if (err instanceof Error && err.toString().includes('requires an index')) {
          needsIndex = true;
          error = 'This feature requires a database index to be created. Please follow the link in the console to create it, then try again.';
        } else {
          error = 'Failed to load existing entry.';
        }
      } finally {
        isLoading = false;
      }
    }
  });
  
  function getPeriodTitle(type: string, id: string) {
    const parts = id.split('-');
    
    switch (type) {
      case 'day':
        return `Journal for ${parts[1]}`;
      case 'week':
        return `Journal for Week ${parts[2]}, ${parts[1]}`;
      case 'month':
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                           'July', 'August', 'September', 'October', 'November', 'December'];
        return `Journal for ${monthNames[parseInt(parts[2]) - 1]} ${parts[1]}`;
      case 'year':
        return `Journal for ${parts[1]}`;
      default:
        return 'Journal Entry';
    }
  }
  
  async function handleSave() {
    if (!content.trim()) return;
    
    isSaving = true;
    error = '';
    success = '';
    
    try {
      if ($user) {
        // Pass the current periodId and periodType
        await addJournalEntry($user.uid, content, periodId, periodType);
        success = 'Journal entry saved!';
        
        // Close modal after a short delay
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err) {
      console.error('Error saving journal entry:', err);
      error = 'Failed to save your journal entry. Please try again.';
    } finally {
      isSaving = false;
    }
  }
</script>

<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 md:p-0" transition:fade>
  <div 
    class="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-auto" 
    transition:fly={{ y: 20, duration: 300, easing: quintOut }}
  >
    <div class="p-4 md:p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg md:text-xl font-semibold text-gray-900 pr-2">{periodTitle}</h2>
        <!-- svelte-ignore a11y_consider_explicit_label -->
        <button 
          class="text-gray-500 hover:text-gray-700 p-2" 
          on:click={onClose}
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {#if error}
        <div class="bg-red-100 border border-red-400 text-red-700 px-3 py-2 text-sm md:text-base rounded mb-4" transition:fade>
          {error}
          {#if needsIndex}
            <p class="mt-2 text-xs md:text-sm">
              This is a one-time setup. Please check the browser console for a link to create the required index.
            </p>
          {/if}
        </div>
      {/if}
      
      {#if success}
        <div class="bg-green-100 border border-green-400 text-green-700 px-3 py-2 text-sm md:text-base rounded mb-4" transition:fade>
          {success}
        </div>
      {/if}
      
      {#if isLoading}
        <div class="flex justify-center items-center h-32">
          <svg class="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      {:else}
        <div class="mb-4">
          <label for="journal-content" class="block text-sm font-medium text-gray-700 mb-1">
            {existingEntry ? 'Edit your journal entry' : 'Write your thoughts for this time period'}
          </label>
          <textarea
            id="journal-content"
            bind:value={content}
            rows="6"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm md:text-base"
            placeholder="What's on your mind for this period?"
          ></textarea>
        </div>
        
        <div class="flex justify-end">
          <button
            type="button"
            class="mr-3 inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            on:click={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            class="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            on:click={handleSave}
            disabled={isSaving || !content.trim()}
          >
            {#if isSaving}
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            {:else}
              Save Entry
            {/if}
          </button>
        </div>
      {/if}
    </div>
  </div>
</div>

<div class="text-sm text-gray-500 mb-4">
  Recording at: {currentTime.hours.toString().padStart(2, '0')}:{currentTime.minutes.toString().padStart(2, '0')}:{currentTime.seconds.toString().padStart(2, '0')}
</div>