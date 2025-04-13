// Simple FLIP animation action for Svelte
export default function flip(node: HTMLElement, { duration = 400 }) {
  return {
    update() {
      // Get the current position
      const rect = node.getBoundingClientRect();
      
      return {
        duration,
        css: (t: number) => {
          return `
            transform: translate(${(1 - t) * rect.left}px, ${(1 - t) * rect.top}px);
          `;
        }
      };
    }
  };
}