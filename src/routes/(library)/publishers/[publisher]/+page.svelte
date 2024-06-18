<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';
  import Book from '$lib/components/Links/BookLink.svelte';
  import type { PageData } from './$types';
  import MarkdownContent from '$lib/components/MarkdownContent.svelte';
  import CreatorLink from '$lib/components/Links/CreatorLink.svelte';

  export let data: PageData;
  $: publisher = data.publisher;
  $: books = data.books;
  $: creators = data.creators;

  let publisherInfoLoading: boolean = false;
</script>

<div class="flex max-w-6xl mx-auto w-full py-16 px-8">
  <article class="flex-grow space-y-12">
    <header class="grid grid-cols-[max-content_auto] grid-rows-[min-content_1fr] gap-x-8 gap-y-4">
      <div
        class="flex items-center justify-center w-32 h-32 rounded-full bg-gray-100 border
        border-gray-200 dark:border-gray-800 dark:bg-gray-700 shadow-lg
        object-cover row-span-2"
      >
        {#if publisher.image}
          <img
            src={publisher.image}
            alt="Picture representing publisher {publisher.name}"
            class="w-full h-full"
          />
        {:else}
          <div class="flex items-center justify-center">
            <Icon name="domain" class="text-4xl text-gray-500" />
          </div>
        {/if}
      </div>

      <h1 class="text-4xl font-bold font-serif">{publisher.name}</h1>

      {#if publisher.description}
        <div>
          <MarkdownContent
            class="text-lg text-gray-700 dark:text-gray-300"
            source={publisher.description}
          />
          {#if publisher.wikipedia_url}
            <a target="_blank" href={publisher.wikipedia_url} class="text-blue-500 underline">
              Wikipedia
            </a>
          {/if}
        </div>
      {:else}
        <div class="text-sm text-blue-500 flex items-center self-start cursor-pointer select-none">
          <div class="mr-1">
            {#if publisherInfoLoading}
              <Icon name="sync" class="text-lg" />
            {:else}
              <Icon name="lightbulb" class="text-lg" />
            {/if}
          </div>

          <span class="text-blue-500 underline">
            It seems like there is no information available on this publisher yet.
            Search the web
          </span>
        </div>
      {/if}
    </header>

    <section>
      <header class="mb-4">
        <h2 class="text-2xl font-medium font-serif">Published Authors</h2>
      </header>

      {#await creators}
        <span>Loading...</span>
      {:then creators}
        {#if creators.length === 0}
          <p>No authors found.</p>
        {:else}
          <ul class="grid gap-4 grid-cols-3">
            {#each creators as creator}
              <li class="contents">
                <CreatorLink {creator} />
              </li>
            {/each}
          </ul>
        {/if}
      {/await}
    </section>

    <section>
      <header class="mb-4">
        <h2 class="text-2xl font-medium font-serif">Published Works</h2>
      </header>

      {#await books}
        <span>Loading...</span>
      {:then books}
        <ul class="grid grid-cols-2 xl:grid-cols-6 md:grid-cols-4 gap-8">
          {#each books as book}
            <li class="contents">
              <Book book={book} />
            </li>
          {/each}
        </ul>
      {/await}
    </section>
  </article>
</div>
