<script lang="ts">
  import BlurhashPanel from '$lib/components/BlurhashPanel.svelte';
  import GrainOverlay from '$lib/components/GrainOverlay.svelte';

  let className: string;
  // noinspection ReservedWordAsName
  export { className as class };

  export let blurhash: string | undefined | null;
</script>

<div
  class="w-full transition will-change-auto {className}"
  aria-hidden="true"
  {...$$restProps}
>
  <!-- On top of the blurhash or gradient area, we render some noise, making for a neat visual effect -->
  <GrainOverlay class="absolute {blurhash ? 'opacity-35 dark:opacity-50' : ''}" />

  {#if blurhash}
    <BlurhashPanel class="w-full h-full" blurhash={blurhash} />
  {:else}
    <div class="absolute inset-0 opacity-60 bg-gradient-to-r from-cyan-500 to-blue-500" />
  {/if}
</div>
