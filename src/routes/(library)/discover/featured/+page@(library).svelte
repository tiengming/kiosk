<script lang="ts">
  import type { PageData } from './$types';
  import ContentSection from '$lib/components/ContentSection.svelte';

  export let data: PageData;
  $: featured = data.featured;
</script>

<article>
  <header class="mb-8">
    <ContentSection padding>
      <h1 class="text-4xl font-bold font-serif">Featured Books</h1>

      <span class="mt-2 text-gray-500">Discover new books from various stores.</span>
    </ContentSection>
  </header>

  <ContentSection>
    <section id="project-gutenberg" class="bg-gray-50 rounded-3xl p-6 shadow-inner">
      <header>
        <h2 class="text-2xl font-bold font-serif">Project Gutenberg</h2>
      </header>

      {#await featured.gutendex}
        <p>Loading...</p>
      {:then books}
        <ul class="grid grid-cols-4 gap-4 mt-4">
          {#each books as book}
            <li class="flex flex-col items-center justify-between p-4 bg-white rounded-3xl shadow-md">
              <div>
                <h3 class="text-xl font-bold font-serif">{book.title}</h3>
                <p class="text-gray-500">{book.authors.map(({ name }) => name).join(' & ')}</p>
              </div>
              <a href={book.url} target="_blank" class="text-blue-500">Read</a>
            </li>
          {/each}
        </ul>
      {:catch error}
        <p>{error.message}</p>
      {/await}
    </section>
  </ContentSection>
</article>
