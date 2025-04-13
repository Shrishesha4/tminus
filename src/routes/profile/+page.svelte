<script lang="ts">
	import { onMount } from 'svelte';
	import { user, isLoading } from '$lib/stores/authStore';
	import { goto } from '$app/navigation';
	import { db } from '$lib/firebase/client';
	import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
	import { deleteUser, GoogleAuthProvider, reauthenticateWithPopup } from 'firebase/auth';
	import { getProfileImageUrl } from '$lib/firebase/client';
	import { signOut } from '$lib/services/authService';
	import { auth } from '$lib/firebase/client';
	import { getIdToken } from 'firebase/auth';
	import { DEFAULT_LIFE_EXPECTANCY } from '$lib/utils/timeUtils';

	let userData: any = null;
	let isLoadingData = true;
	let isSaving = false;
	let isDeleting = false;
	let error = '';
	let success = '';
	let showDeleteConfirm = false;

	// Form fields
	let displayName = '';
	let birthdate = '';
	let birthTime = '';
	let lifeExpectancy = 75; // Default value

	// Add a timeout to prevent infinite loading
	let loadingTimeout: ReturnType<typeof setTimeout>;

	onMount(() => {
		// console.log("Profile mounted, user:", $user?.uid || "null", "isLoading:", $isLoading);
		
		// Set a timeout to prevent infinite loading
		loadingTimeout = setTimeout(() => {
			console.log("Profile loading timeout reached, forcing state update");
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
			
			await loadUserData();
		})();
		
		// Return the cleanup function directly
		return () => {
			// Clear timeout when component is destroyed
			clearTimeout(loadingTimeout);
		};
	});
	
	async function loadUserData() {
		isLoadingData = true;
		error = '';
		
		try {
			if ($user) {
				const userDoc = await getDoc(doc(db, 'users', $user.uid));
				if (userDoc.exists()) {
					userData = userDoc.data();
					
					// Initialize form fields
					displayName = $user.displayName || '';
					birthdate = userData.birthdate || '';
					birthTime = userData.birthTime || '';
					lifeExpectancy = userData.lifeExpectancy || 75; // Load custom life expectancy if set
				} else {
					goto('/onboarding');
				}
			}
		} catch (err) {
			error = 'Failed to load your profile data. Please try again.';
			console.error(err);
		} finally {
			isLoadingData = false;
			clearTimeout(loadingTimeout); // Clear the timeout when data is loaded
		}
	}

	async function handleSaveProfile() {
		if (!birthdate) {
			error = 'Birthdate is required';
			return;
		}
		
		// Validate life expectancy
		if (lifeExpectancy < 1 || lifeExpectancy > 150) {
			error = 'Life expectancy must be between 1 and 150 years';
			return;
		}
		
		isSaving = true;
		error = '';
		success = '';
		
		try {
			if ($user) {
				await updateDoc(doc(db, 'users', $user.uid), {
					birthdate,
					birthTime: birthTime || null,
					lifeExpectancy: Number(lifeExpectancy), // Store as number
					updatedAt: new Date()
				});
				
				success = 'Profile updated successfully!';
				await loadUserData(); // Reload data
			}
		} catch (err) {
			error = 'Failed to update your profile. Please try again.';
			console.error(err);
		} finally {
			isSaving = false;
		}
	}

	async function handleDeleteAccount() {
		if (!showDeleteConfirm) {
			showDeleteConfirm = true;
			return;
		}
		
		isDeleting = true;
		error = '';
		
		try {
			if ($user) {
				try {
					// Re-authenticate the user before deletion
					const provider = new GoogleAuthProvider();
					if (!auth.currentUser) throw new Error('User not authenticated');
					await reauthenticateWithPopup(auth.currentUser, provider);
					
					// Get the current user's ID token (which will now be fresh)
					const idToken = auth.currentUser ? await getIdToken(auth.currentUser) : null;
					
					// Call the server-side API to delete the account
					const response = await fetch('/api/user/delete', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							userId: $user.uid,
							idToken
						})
					});
					
					if (!response.ok) {
						throw new Error('Failed to delete account');
					}
					
					// If server-side deletion fails, try client-side deletion as fallback
					try {
						if (auth.currentUser) {
							await deleteUser(auth.currentUser);
						}
					} catch (err) {
						console.log('Client-side deletion skipped, already handled by server');
					}
					
					// Sign out and redirect
					await signOut();
					goto('/');
				} catch (authErr) {
					// Handle re-authentication errors specifically
					if ((authErr as { code?: string }).code === 'auth/cancelled-popup-request' ||
							(authErr as { code?: string }).code === 'auth/popup-closed-by-user') {
						error = 'Authentication cancelled. Please try again to confirm account deletion.';
					} else {
						error = 'Authentication required. Please try again to confirm account deletion.';
					}
					console.error('Auth error during account deletion:', authErr);
					isDeleting = false;
					return;
				}
			}
		} catch (err) {
			error = 'Failed to delete your account. Please try again.';
			console.error('Account deletion error:', err);
		} finally {
			isDeleting = false;
			showDeleteConfirm = false;
		}
	}

	function cancelDelete() {
		showDeleteConfirm = false;
	}

	async function handleSignOut() {
		try {
			await signOut();
			goto('/');
		} catch (err) {
			error = 'Failed to sign out. Please try again.';
			console.error(err);
		}
	}

	// Add a function to refresh the profile image if needed
    function refreshProfileImage() {
		if ($user && $user.photoURL) {
			// Clear any fallback setting to try loading the image again
			localStorage.removeItem('useProfileImageFallback');
			// Force a refresh by triggering a store update without modifying the user object
			user.update(currentUser => currentUser);
		}
	}
</script>

<div class="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<h1 class="text-3xl font-bold mb-8">Your Profile</h1>
	
	{#if error}
		<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
			{error}
		</div>
	{/if}
	
	{#if success}
		<div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
			{success}
		</div>
	{/if}
	
	{#if isLoadingData || $isLoading}
		<div class="flex justify-center items-center h-64">
			<svg class="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
				<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
			</svg>
		</div>
	{:else if $user}
		<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
			<!-- Profile Summary -->
			<div class="bg-white p-6 rounded-lg shadow">
				<div class="flex flex-col items-center">
					<!-- Update the profile image section -->
					<div class="relative">
						<img 
                            src={getProfileImageUrl($user)} 
                            alt="Profile" 
                            class="h-24 w-24 rounded-full mb-4 object-cover border-2 border-gray-200"
                            on:error={() => {
                                // If image fails, set fallback and refresh
                                localStorage.setItem('useProfileImageFallback', 'true');
                                user.update(currentUser => currentUser);
                            }}
                        />
						<!-- svelte-ignore a11y_consider_explicit_label -->
						<button 
							on:click={refreshProfileImage}
							class="absolute bottom-4 right-0 bg-gray-100 p-1 rounded-full hover:bg-gray-200"
							title="Refresh profile image"
						>
							<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
							</svg>
						</button>
					</div>
					<h2 class="text-xl font-semibold">{$user.displayName || 'User'}</h2>
					<p class="text-gray-600">{$user.email}</p>
					
					<!-- Add a note about Google profile -->
					<p class="text-xs text-gray-500 mt-2 text-center">
						Profile picture and name are managed through your Google account
					</p>
					
					<div class="mt-6 w-full">
						<h3 class="text-lg font-medium mb-2">Account Info</h3>
						<div class="text-sm text-gray-600">
							<p class="mb-1"><span class="font-medium">Birthdate:</span> {birthdate}</p>
							{#if birthTime}
								<p class="mb-1"><span class="font-medium">Birth Time:</span> {birthTime}</p>
							{/if}
							<p class="mb-1"><span class="font-medium">Account Created:</span> {userData?.createdAt?.toDate().toLocaleDateString() || 'Unknown'}</p>
						</div>
					</div>
					
					<!-- Add Sign Out Button -->
					<button
						on:click={handleSignOut}
						class="mt-6 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
					>
						Sign Out
					</button>
				</div>
			</div>
			
			<!-- Edit Profile -->
			<div class="bg-white p-6 rounded-lg shadow md:col-span-2">
				<h2 class="text-xl font-semibold mb-4">Edit Profile</h2>
				
				<form on:submit|preventDefault={handleSaveProfile} class="space-y-4">
					<div>
						<label for="displayName" class="block text-sm font-medium text-gray-700 mb-1">
							Display Name
						</label>
						<p class="text-xs text-gray-500 mb-2">
							Your display name is managed through your Google account
						</p>
						<input
							type="text"
							id="displayName"
							bind:value={displayName}
							disabled
							class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-100"
						/>
					</div>
					
					<div>
						<label for="birthdate" class="block text-sm font-medium text-gray-700 mb-1">
							Birthdate <span class="text-red-500">*</span>
						</label>
						<input
							type="date"
							id="birthdate"
							bind:value={birthdate}
							required
							class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
					</div>
					
					<!-- New Life Expectancy field -->
					<div>
						<label for="lifeExpectancy" class="block text-sm font-medium text-gray-700 mb-1">
							Life Expectancy (years)
						</label>
						<div class="flex items-center">
							<input
								type="number"
								id="lifeExpectancy"
								bind:value={lifeExpectancy}
								min="1"
								max="150"
								class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
							/>
						</div>
						<p class="text-xs text-gray-500 mt-1">
							This setting affects how your remaining time is calculated
						</p>
					</div>
					
					<div class="flex justify-end">
						<button
							type="submit"
							class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
							disabled={isSaving}
						>
							{#if isSaving}
								<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
									<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
									<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
								Saving...
							{:else}
								Save Changes
							{/if}
						</button>
					</div>
				</form>
			</div>
			
			<div class="bg-white p-6 rounded-lg shadow md:col-span-3 mt-8">
				<h2 class="text-xl font-semibold mb-4">Support the Creator</h2>
				<p class="text-gray-600 mb-4">
					If you find T-Minus helpful in your life journey, please consider supporting the ongoing development and maintenance of this app.
				</p>
				
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
					<a 
						href="https://www.buymeacoffee.com/shrishesha4" 
						target="_blank" 
						rel="noopener noreferrer"
						class="flex flex-col items-center p-4 border border-yellow-200 rounded-lg bg-yellow-50 hover:bg-yellow-100 transition-colors"
					>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-yellow-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
						</svg>
						<span class="font-medium">Buy Me a Coffee</span>
						<span class="text-sm text-gray-500 mt-1">One-time support</span>
					</a>
					
					<a 
						href="https://www.shrishesha.online" 
						target="_blank" 
						rel="noopener noreferrer"
						class="flex flex-col items-center p-4 border border-red-200 rounded-lg bg-red-50 hover:bg-red-100 transition-colors"
					>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-red-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<span class="font-medium">Visit my Website</span>
						<span class="text-sm text-gray-500 mt-1">Get to know me!</span>
					</a>
					
					<!-- <a 
						href="https://github.com/tminusapp/tminus" 
						target="_blank" 
						rel="noopener noreferrer"
						class="flex flex-col items-center p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
					>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-700 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
						</svg>
						<span class="font-medium">Contribute Code</span>
						<span class="text-sm text-gray-500 mt-1">Open source project</span>
					</a> -->
				</div>
				
				<div class="mt-6 text-center text-sm text-gray-500">
					Your support helps keep this project alive and enables new features to be developed.
					<br>Thank you for being part of the T-Minus journey!
				</div>
			</div>
			
			<div class="mt-4 pt-8 border-t border-gray-200">
				<h3 class="text-lg font-medium text-red-600 mb-4">Danger Zone</h3>
				
				{#if showDeleteConfirm}
					<div class="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
						<p class="text-sm text-red-700 mb-4">
							Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data.
						</p>
						<div class="flex space-x-3">
							<button
								on:click={handleDeleteAccount}
								disabled={isDeleting}
								class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-400"
							>
								{#if isDeleting}
									<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
										<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
										<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
									</svg>
									Deleting...
								{:else}
									Yes, Delete My Account
								{/if}
							</button>
							<button
								on:click={cancelDelete}
								class="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
							>
								Cancel
							</button>
						</div>
					</div>
				{:else}
					<button
						on:click={handleDeleteAccount}
						class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
					>
						Delete Account
					</button>
				{/if}
			</div>
		</div>
	{/if}
</div>
