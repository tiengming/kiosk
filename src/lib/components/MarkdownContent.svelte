<script lang="ts">
  import Markdown from 'svelte-markdown';
  import { twMerge } from 'tailwind-merge';

  let className = '';
  // noinspection ReservedWordAsName
  export { className as class };

  export let source: string = '';

  const renderers = {};
</script>

<div class="markdown-container {twMerge('leading-relaxed text-lg', className)}">
  <Markdown {source} {renderers} />
</div>

<style lang="postcss">
    :global(.markdown-container h1),
    :global(.markdown-container h2),
    :global(.markdown-container h3),
    :global(.markdown-container h4),
    :global(.markdown-container h5),
    :global(.markdown-container h6) {
        @apply font-serif mt-[1em];
    }

    :global(.markdown-container h1) {
        @apply text-4xl font-bold mb-2;
    }

    :global(.markdown-container h2) {
        @apply text-3xl font-bold mb-1;
    }

    :global(.markdown-container h3) {
        @apply text-2xl font-semibold mb-0.5;
    }

    :global(.markdown-container h3) {
        @apply text-xl font-semibold mb-0.5;
    }

    :global(.markdown-container h4) {
        @apply text-lg font-semibold;
    }

    :global(.markdown-container h5) {
        @apply text-base font-semibold;
    }

    :global(.markdown-container h6) {
        @apply text-sm font-semibold;
    }

    :global(.markdown-container p) {
        @apply leading-[inherit];
    }

    :global(.markdown-container p + p) {
        @apply mt-[0.5em]
    }

    :global(.markdown-container blockquote) {
        @apply my-6 border-l-4 border-gray-300 pl-4 italic font-serif;
    }
</style>
