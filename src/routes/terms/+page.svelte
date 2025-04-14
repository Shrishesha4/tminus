<script lang="ts">
	import { fade } from 'svelte/transition';
</script>

<div class="max-w-4xl mx-auto py-8 px-4" in:fade={{ duration: 300 }}>
	<h1 class="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
	
	<div class="prose prose-indigo max-w-none">
		<p class="text-lg mb-6">Last updated: {new Date().toLocaleDateString()}</p>
		
		<h2 class="text-xl font-semibold mt-8 mb-4">1. Introduction</h2>
		<p>Welcome to T-Minus ("we," "our," or "us"). By accessing or using our service, you agree to be bound by these Terms of Service ("Terms"). Please read these Terms carefully before using our application.</p>
		
		<h2 class="text-xl font-semibold mt-8 mb-4">2. Acceptance of Terms</h2>
		<p>By accessing or using T-Minus, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree to these Terms, please do not use our service.</p>
		
		<h2 class="text-xl font-semibold mt-8 mb-4">3. Description of Service</h2>
		<p>T-Minus is a life countdown application that helps users visualize and track the passage of time in their lives. The service allows users to log journal entries, receive insights, and gain perspective on their life journey.</p>
		
		<h2 class="text-xl font-semibold mt-8 mb-4">4. User Accounts</h2>
		<p>To use certain features of our service, you may need to create an account. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account. You agree to:</p>
		<ul class="list-disc pl-6 mb-4">
			<li>Provide accurate and complete information when creating your account</li>
			<li>Update your information to keep it accurate and current</li>
			<li>Protect your account credentials and not share them with others</li>
			<li>Notify us immediately of any unauthorized use of your account</li>
		</ul>
		
		<h2 class="text-xl font-semibold mt-8 mb-4">5. User Content</h2>
		<p>Our service allows you to create, upload, and share content such as journal entries. You retain ownership of any content you submit, but grant us a non-exclusive, royalty-free license to use, reproduce, and display such content in connection with providing and improving our service.</p>
		
		<h2 class="text-xl font-semibold mt-8 mb-4">6. Prohibited Conduct</h2>
		<p>You agree not to:</p>
		<ul class="list-disc pl-6 mb-4">
			<li>Use our service for any illegal purpose</li>
			<li>Violate any laws or regulations</li>
			<li>Impersonate any person or entity</li>
			<li>Interfere with or disrupt our service</li>
			<li>Attempt to gain unauthorized access to our systems</li>
		</ul>
		
		<h2 class="text-xl font-semibold mt-8 mb-4">7. Termination</h2>
		<p>We reserve the right to suspend or terminate your access to our service at any time for any reason without notice. You may also terminate your account at any time.</p>
		
		<h2 class="text-xl font-semibold mt-8 mb-4">8. Disclaimer of Warranties</h2>
		<p>Our service is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not guarantee that our service will be uninterrupted, secure, or error-free.</p>
		
		<h2 class="text-xl font-semibold mt-8 mb-4">9. Limitation of Liability</h2>
		<p>To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use our service.</p>
		
		<h2 class="text-xl font-semibold mt-8 mb-4">10. Changes to Terms</h2>
		<p>We may modify these Terms at any time. If we make material changes, we will notify you through our service or by other means. Your continued use of our service after such modifications constitutes your acceptance of the updated Terms.</p>
		
		<h2 class="text-xl font-semibold mt-8 mb-4">11. Contact Information</h2>
		<p>If you have any questions about these Terms, please contact us at <a href="mailto:inquiry@shrishesha.online">inquiry@shrishesha.online</a></p>
	</div>
	
	<div class="mt-10 text-center">
		<a href="/" class="text-indigo-600 hover:text-indigo-800">Return to Home</a>
	</div>
</div>