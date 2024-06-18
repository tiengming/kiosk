<script lang="ts" context="module">
  import type { PageData } from './$types';

  export type Feed = Awaited<PageData['feed']>;
  export type Category = Feed['categories'][number];
  export type Entry = Feed['entries'][number];
</script>

<script lang="ts">
  import CategoryItem, { type NavigateEvent } from './Category.svelte';
  import LoadingSpinner from '$lib/LoadingSpinner.svelte';
  import { fade } from 'svelte/transition';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { encodeBreadcrumbs } from './breadcrumbs';
  import Breadcrumbs from './Breadcrumbs.svelte';
  import EntryItem from './Entry.svelte';
  import Icon from '$lib/components/Icon.svelte';

  const transition = { duration: 100 };

  export let data: PageData;
  $: catalog = data.catalog;
  $: feed = data.feed;
  $: breadcrumbs = data.breadcrumbs;

  function showCategory({ detail: { link, title } }: NavigateEvent) {
    const encoded = encodeBreadcrumbs([link, title ?? '']);
    const newUrl = new URL(`${$page.url.pathname}/${encoded}`, $page.url.href);

    return goto(newUrl);
  }
</script>

<article>
  <header class="mb-8">
    <h1 class="text-3xl font-bold font-serif">{catalog.title}</h1>
    <p class="text-sm text-gray-700 mt-1">{catalog.description}</p>

    <Breadcrumbs items={breadcrumbs} />
  </header>

  {#await feed}
    <div
      class="flex justify-center items-center"
      in:fade={transition}
      out:fade={transition}
    >
      <LoadingSpinner class="my-16" />
    </div>
  {:then feed}
    <div in:fade={{delay: 10, ...transition}} out:fade={transition}>
      <nav>
        <ul class="grid gap-4 grid-cols-2">
          {#each feed.categories as entry}
            <li>
              <CategoryItem {entry} on:navigate={showCategory} />
            </li>
          {/each}
        </ul>
      </nav>

      <section>
        <ul class="gap-4 columns-2">
          {#each feed.entries as entry}
            <li class="py-2">
              <EntryItem {entry} />
            </li>
          {/each}
        </ul>

        {#if feed.entries.length + feed.categories.length === 0}
          <div class="p-4 rounded-xl shadow-lg shadow-blue-500/10 bg-blue-50 ring ring-blue-100 text-blue-950">
            <strong class="text-lg font-semibold inline-flex items-center">
              <Icon name="info" class="text-blue-500 mr-2" weight={800} />
              <span>No entries found</span>
            </strong>
            <p>
              There are no entries in this catalog. Try another catalog or check back later.
            </p>
          </div>
        {/if}
      </section>
    </div>
  {:catch error}
    <div class="p-4 rounded-xl shadow-lg shadow-red-500/10 bg-red-50 ring ring-red-200 text-red-950">
      <strong class="text-lg font-semibold inline-flex items-center">
        <Icon name="error" class="text-red-500 mr-2" weight={800} />
        Something went wrong
      </strong>
      <p>
        It seems like something went wrong trying to load this catalog. Please try again later.
      </p>

      <details class="mt-4">
        <summary class="cursor-pointer">View technical details</summary>
        <strong class="font-semibold">{error.message}</strong>
        <pre
          class="mt-2 overflow-x-auto bg-red-100 shadow-inner-sm rounded-xl p-4 text-sm"
        >{JSON.stringify(error, null, 2)}</pre>
      </details>
    </div>
  {/await}
</article>
