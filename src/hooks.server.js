/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
  // Make client-side env vars available to server-side code
  if (import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) {
    process.env.GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  }
  
  return await resolve(event);
}