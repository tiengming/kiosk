<script lang="ts">
  import BlurhashPanel from '$lib/components/BlurhashPanel.svelte';

  let className = '';
  // noinspection ReservedWordAsName
  export { className as class };

  export let imageClasses: string = '';

  export let book: string;
  export let edition: string | undefined | null = undefined;
  export let title: string = '';
  export let blurhash: string | undefined | null = undefined;
  export let src = `/books/${book}/cover/file${edition ? `?edition=${edition}` : ''}`;
  export let alt: string = `Cover of ${title}`;

  let missingCover: boolean = false;

  function handleFileError() {
    missingCover = true;
  }
</script>

<div class="relative bg-blue-200 dark:bg-blue-800 rounded overflow-hidden {className}" {...$$restProps}>
  <img
    {src}
    {alt}
    class="{imageClasses} block m-0 w-full h-auto max-h-[inherit]"
    class:opacity-0={missingCover}
    on:error={handleFileError}
  >

  {#if missingCover}
    {#if blurhash}
      <BlurhashPanel class="inset-0 absolute w-full h-full" {blurhash} />
    {/if}

    <span class="absolute block px-4 text-center top-6 left-2 font-serif text-xs opacity-85 select-none">
      {title}
    </span>
  {/if}
</div>

<style lang="postcss">
    div {
        @apply relative;
    }

    div::after {
        @apply absolute block w-full h-full top-0 left-0 z-20 rounded content-[''];
        background: linear-gradient(
                to right,
                rgba(60, 13, 20, 0.2) 0.75%,
                rgba(255, 255, 255, 0.5) 1.25%,
                rgba(255, 255, 255, 0.25) 1.75%,
                rgba(255, 255, 255, 0.25) 2.5%,
                rgba(0, 0, 0, 0.05) 3%, transparent 4%,
                rgba(255, 255, 255, 0.25) 4.25%,
                transparent 5.5%
        );
    }
</style>
