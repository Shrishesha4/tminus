<script lang="ts">
	import { fade } from 'svelte/transition';
</script>

<div class="max-w-4xl mx-auto py-8 px-4" in:fade={{ duration: 300 }}>
	<h1 class="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
	
	<div class="prose prose-indigo max-w-none">
		<p class="text-lg mb-6">Last updated: {new Date().toLocaleDateString()}</p>
		
		<h2 class="text-xl font-semibold mt-8 mb-4">1. Introduction</h2>
		<p>At T-Minus, we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our application.</p>
		
		<h2 class="text-xl font-semibold mt-8 mb-4">2. Information We Collect</h2>
		<p>We collect the following types of information:</p>
		<ul class="list-disc pl-6 mb-4">
			<li><strong>Account Information:</strong> When you create an account, we collect your name, email address, and profile picture (if provided through authentication services).</li>
			<li><strong>User Content:</strong> We collect and store the journal entries and other content you create within our application.</li>
			<li><strong>Personal Information:</strong> We collect your birthdate and optional birth time to calculate time-related visualizations.</li>
			<li><strong>Usage Data:</strong> We collect information about how you interact with our application, including access times and features used.</li>
		</ul>
		
		<h2 class="text-xl font-semibold mt-8 mb-4">3. How We Use Your Information</h2>
		<p>We use your information for the following purposes:</p>
		<ul class="list-disc pl-6 mb-4">
			<li>To provide and maintain our service</li>
			<li>To calculate time visualizations based on your birthdate</li>
			<li>To store and process your journal entries</li>
			<li>To improve and personalize your experience</li>
			<li>To communicate with you about our service</li>
			<li>To detect and prevent fraud or abuse</li>
		</ul>
		
		<h2 class="text-xl font-semibold mt-8 mb-4">4. Data Storage and Security</h2>
		<p>We use Firebase, a Google Cloud service, to store your data. We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure.</p>
		
		<h2 class="text-xl font-semibold mt-8 mb-4">5. Data Sharing and Disclosure</h2>
		<p>We do not sell your personal information to third parties. We may share your information in the following circumstances:</p>
		<ul class="list-disc pl-6 mb-4">
			<li>With service providers who help us operate our application</li>
			<li>To comply with legal obligations</li>
			<li>To protect our rights, privacy, safety, or property</li>
			<li>In connection with a business transfer, such as a merger or acquisition</li>
		</ul>
		
		<h2 class="text-xl font-semibold mt-8 mb-4">6. Your Rights</h2>
		<p>Depending on your location, you may have certain rights regarding your personal information, including:</p>
		<ul class="list-disc pl-6 mb-4">
			<li>The right to access your personal information</li>
			<li>The right to correct inaccurate information</li>
			<li>The right to delete your personal information</li>
			<li>The right to restrict or object to processing</li>
			<li>The right to data portability</li>
		</ul>
		<p>To exercise these rights, please contact us using the information provided below.</p>
		
		<h2 class="text-xl font-semibold mt-8 mb-4">7. Children's Privacy</h2>
		<p>Our service is not intended for individuals under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete that information.</p>
		
		<h2 class="text-xl font-semibold mt-8 mb-4">8. Changes to This Privacy Policy</h2>
		<p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.</p>
		
		<h2 class="text-xl font-semibold mt-8 mb-4">9. Contact Us</h2>
		<p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:inquiry@shrishesha.online">inquiry@shrishesha.online</a></p>
	</div>
	
	<div class="mt-10 text-center">
		<a href="/" class="text-indigo-600 hover:text-indigo-800">Return to Home</a>
	</div>
</div>