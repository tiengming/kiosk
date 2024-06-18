<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';

  export let open: boolean = false;

  function close() {
    open = false;
  }
</script>

<!-- svelte-ignore a11y-autofocus -->
<button
  class="absolute right-0 -top-12 ml-auto w-16 h-16 flex flex-col justify-center items-center
  bg-white/20 dark:bg-black/20 hover:bg-white/40 dark:hover:bg-black/60 transition text-white/80
  hover:text-white rounded-full"
  aria-label="Close dialog"
  on:click={close}
  tabindex="0"
  autofocus
>
  <Icon name="close" weight={500} class="text-4xl" />

  <span
    aria-hidden="true"
    class="flex text-[8px] space-x-px absolute bottom-1 opacity-75 dark:opacity-50 left-1/2
    -translate-x-1/2"
  >
      <span class="block rotate-6">E</span>
      <span class="block mt-[0.5px]">S</span>
      <span class="block -rotate-6">C</span>
    </span>
</button>
