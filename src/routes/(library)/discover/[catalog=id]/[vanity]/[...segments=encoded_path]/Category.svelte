<script lang="ts" context="module">
  export type NavigateEvent = CustomEvent<{ link: string; title: string; }>;
</script>

<script lang="ts">
  import dayjs from 'dayjs';
  import relativeTime from 'dayjs/plugin/relativeTime.js';
  import type { Category } from './+page.svelte';
  import { createEventDispatcher } from 'svelte';

  dayjs.extend(relativeTime);
  const dispatch = createEventDispatcher<{
    navigate: NavigateEvent['detail'];
  }>();

  export let entry: Category;
  $: timestamp = new Date(entry.lastUpdatedAt).toISOString();
  $: timeAgo = dayjs(entry.lastUpdatedAt).fromNow();

  function navigate() {
    dispatch('navigate', {
      link: entry.link,
      title: entry.title,
    });
  }
</script>

<button
  type="button"
  class="w-full flex flex-col p-4 rounded-xl shadow bg-gray-50 dark:bg-gray-900 hover:bg-gray-100
  dark:hover:bg-gray-800 transition"
  on:click={navigate}
>
  <strong class="font-semibold font-serif whitespace-nowrap max-w-full overflow-hidden text-ellipsis">
    {entry.title}
  </strong>
  {#if entry.lastUpdatedAt}
    <time datetime={timestamp} class="text-gray-500 text-xs">Updated {timeAgo}</time>
  {/if}
</button>
