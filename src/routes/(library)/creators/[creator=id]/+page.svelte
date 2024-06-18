<script lang="ts">
  import type { PageData } from './$types';
  import Icon from '$lib/components/Icon.svelte';
  import BookLink from '$lib/components/Links/BookLink.svelte';

  export let data: PageData;
  $: creator = data.creator;
  $: contributions = data.contributions;
</script>

<article>
  <header class="mb-4 gap-4 grid grid-cols-[min-content_auto] grid-rows-[auto_1fr]">
    <div
      class="row-span-2 w-24 h-24 flex items-center justify-center flex-shrink-0 object-cover rounded-full shadow bg-gray-100">
      {#if creator.image}
        <img src="/creators/{creator.id}/picture" class="rounded-full w-full h-full object-cover"
             alt="Picture of {creator.name}">
      {:else}
        <Icon name="person" class="leading-none text-gray-500" />
      {/if}
    </div>
    <h1 class="text-3xl font-bold font-serif">{creator.name}</h1>
    <p class="text-sm text-gray-500">{creator.description}</p>
  </header>

  <section>
    <header class="mb-4">
      <h2 class="text-2xl">Works</h2>
    </header>

    {#await contributions}
      <span>Loading...</span>
    {:then contributions}
      <ul class="grid grid-cols-2 xl:grid-cols-6 md:grid-cols-4 gap-8">
        {#each contributions as work}
          <li class="contents">
            <BookLink
              book={work.book_id ?? ''}
              edition={work.id}
              title={work.title}
              blurhash={work.cover_blurhash}
            />
          </li>
        {/each}
      </ul>
    {/await}
  </section>
</article>
