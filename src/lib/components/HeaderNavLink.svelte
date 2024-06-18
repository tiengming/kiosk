<script lang="ts">
  import { page } from '$app/stores';
  import Icon from '$lib/components/Icon.svelte';
  import { createEventDispatcher } from 'svelte';

  export let title: string;
  export let to: string | undefined = undefined;
  export let icon: string | undefined | null = undefined;
  export let emoji: string | undefined | null = undefined;

  const dispatch = createEventDispatcher<{ click }>();

  const handleClick = (event: MouseEvent) => {
    if (!to) {
      event.preventDefault();
      dispatch('click');
    }
  };

  $: active = $page.url.pathname === to;
</script>

<li class="contents">
  <a class="flex justify-center md:justify-start items-center py-4 md:py-1 md:px-2 rounded-md
     transition text-gray-500 dark:text-gray-400 dark:hover:text-gray-300 hover:text-gray-700
     focus-visible:text-gray-700 dark:focus-visible:text-gray-300 hover:bg-gray-200
     focus-visible:bg-gray-200 outline-none focus-visible:ring group/link"
     class:active={active}
     aria-current={active ? 'page' : 'false'}
     href={to || '#'}
     on:click={handleClick}>
    <slot name="icon">
      {#if icon}
        <Icon class="md:mr-2 text-3xl md:text-xl mt-[1.5px]" name={icon} />
      {:else if emoji}
        <span class="md:mr-2 text-3xl md:text-xl">{emoji}</span>
      {/if}
    </slot>
    <div class="hidden md:contents">
      <slot>
        <span>{title}</span>
      </slot>
    </div>
  </a>
</li>

<style lang="postcss">
    .active {
        @apply bg-gray-200 dark:bg-gray-700;
    }
</style>
