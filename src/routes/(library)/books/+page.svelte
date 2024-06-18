<script lang="ts">
  import Field from '$lib/components/Form/Field.svelte';
  import BookLink from '$lib/components/Links/BookLink.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
  $: books = data.books;

  let searchTerm = '';
</script>

<article>
  <header class="pb-8 flex items-center justify-between">
    <h1 class="text-4xl font-medium font-serif">Books</h1>

    <div class="actions">
      <Field placeholder="Search" type="search" appendIcon="search" bind:value={searchTerm} />
    </div>
  </header>

  <ul class="grid grid-cols-2 xl:grid-cols-6 md:grid-cols-4 gap-8">
    {#each books as book}
      <li class="contents">
        <BookLink
          book={book.book_id ?? book.id}
          title={book.title}
          edition={book.main_edition_id}
          blurhash={book.cover_blurhash}
        />
      </li>
    {/each}
  </ul>
</article>
