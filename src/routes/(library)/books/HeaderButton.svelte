<script lang="ts">
  let className = '';
  // noinspection ReservedWordAsName, JSUnusedGlobalSymbols
  export { className as class };
  export let tag = 'button';
</script>

<svelte:element
  this={tag}
  class="relative rounded-md flex items-center text-white py-2 pl-2 pr-4 dark:text-gray-100 text-xl
  bg-transparent hover:bg-white/15 hover:shadow-lg hover:backdrop-blur hover:backdrop-saturate-200
  focus-visible:ring focus-visible:bg-white/15 focus-visible:shadow-lg focus-visible:backdrop-blur
  focus-visible:backdrop-saturate-200 outline-none transition {className}"
  on:click
  on:keydown
  role="button"
  tabindex="0"
  {...$$restProps}
>
  <slot />
</svelte:element>
