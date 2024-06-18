<script lang="ts">
  import { humanReadableFileSize } from '$lib/utilities';
  import MetaItem from './MetaItem.svelte';
  import type { Book, Publisher } from './+page@(library).svelte';

  let className = '';
  // noinspection ReservedWordAsName
  export { className as class };

  export let book: Book;
  export let publisher: Promise<Publisher>;

  let publishingYear: number | undefined = book.published_at
    ? new Date(book.published_at).getUTCFullYear()
    : undefined;

  const size = humanReadableFileSize(book.assets?.at(0)?.size);
</script>

<div class={className}>
  <ul class="flex justify-center items-stretch">
    <!-- TODO: Parse actual thrillers -->
    <MetaItem name="Genre" value="Thriller" />

    {#if book.published_at}
      <MetaItem name="Published" value={publishingYear} />
    {/if}

    {#await publisher}
      <span class="hidden" aria-hidden="true" />
    {:then publisher}
      {#if publisher}
        <MetaItem name="Publisher">
          <a href="/publishers/{publisher.id}">{publisher.name}</a>
        </MetaItem>
      {/if}
    {/await}

    {#if book.language}
      <MetaItem name="Language" value={book.language.toUpperCase()}>
        <span slot="secondary">{book.language_name}</span>
      </MetaItem>
    {/if}

    <MetaItem name="Size" value={size} />
  </ul>
</div>
