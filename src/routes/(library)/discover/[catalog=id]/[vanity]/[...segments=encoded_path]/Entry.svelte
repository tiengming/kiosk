<script lang="ts">
  import type { Entry } from './+page.svelte';
  import dayjs from 'dayjs';
  import relativeTime from 'dayjs/plugin/relativeTime';
  import Button from '$lib/components/Form/Button.svelte';

  dayjs.extend(relativeTime);

  export let entry: Entry;
  $: timestamp = new Date(entry.lastUpdatedAt).toISOString();
  $: timeAgo = dayjs(entry.lastUpdatedAt).fromNow();
  $: authors = entry.authors
    .map(({ name }) => name)
    .join(' & ');

</script>

<article class="bg-gray-50 shadow rounded-xl p-4 overflow-hidden" id="entry-{entry.id}">
  <header class="flex flex-col">
    <div>
      <h3 class="font-medium font-serif w-full">{entry.title}</h3>
      <span class="text-sm text-gray-700">{authors}</span>
    </div>
  </header>

  {#if entry.description}
  <p class="mt-4 text-sm text-gray-700">{entry.description}</p>
    {/if}

  <footer class="flex justify-between items-center mt-4">
    <Button small>Add to library</Button>

    {#if entry.lastUpdatedAt}
      <time datetime={timestamp} class="ml-auto mr-2 text-gray-500 text-xs">
        Updated {timeAgo}
      </time>
    {/if}
  </footer>
</article>
