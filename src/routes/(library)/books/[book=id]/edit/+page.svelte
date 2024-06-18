<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData } from './$types';
  import Field from '$lib/components/Form/Field.svelte';
  import Button from '$lib/components/Form/Button.svelte';
  import MultilineField from '$lib/components/Form/MultilineField.svelte';
  import LanguageField from '$lib/components/Form/LanguageField.svelte';
  import FetchMetadataButton from '../FetchMetadataButton.svelte';

  export let data: PageData;
  $: book = data.book;
  $: creators = data.creators;

  let title = data.book.title;
  $: sortingKey = title.toLowerCase().replace(/[^a-z0-9]+/g, '_');
</script>

<article>
  <header class="mb-8">
    <h1 class="text-3xl font-bold font-serif">Edit book: {book.title}</h1>
    <p class="text-gray-500 dark:text-gray-400 mt-2">
      On this page, you can edit the details of the book.
    </p>
  </header>
  <FetchMetadataButton {book} {creators}/>

  <form use:enhance method="post">
    <div class="grid gap-4">
      <section>
        <header class="mb-2">
          <h2 class="text-lg font-semibold font-serif">Content</h2>
        </header>

        <div class="grid grid-cols-2 gap-4">
          <Field label="Title" name="title" bind:value={title} />
          <Field label="Title Sorting Key" name="sorting_key" value={sortingKey} readonly />
          <MultilineField class="col-span-2" label="Synopsis" name="synopsis" value={book.synopsis || ""} />
          <MultilineField class="col-span-2" label="Excerpt" name="excerpt" value={book.excerpt || ""} />
          <MultilineField class="col-span-2" label="Legal Information" name="legal_information" value={book.legal_information || ""} />
        </div>
      </section>

      <section>
        <header class="mb-2">
          <h2 class="text-lg font-semibold font-serif">Book Specifics</h2>
        </header>

        <div class="grid grid-cols-3 gap-4">
          <Field label="Binding" name="binding" value={book.binding || ""} />
          <Field label="Format" name="format" value={book.format || ""} />
          <Field label="Pages" name="pages" type="number" min="0" step="1" value={book.pages?.toString() || ""} />
<!--          <LanguageField label="Language" name="language" value={book.language || ""} />-->
        </div>
      </section>

      <section>
        <header class="mb-2">
          <h2 class="text-lg font-semibold font-serif">Publishing</h2>
        </header>

        <div class="grid gap-4">
          <Field label="Publication date" name="published_at" type="date" value={book.published_at || ""} />
        </div>
      </section>

      <section>
        <header class="mb-2">
          <h2 class="text-lg font-semibold font-serif">Identifiers</h2>
        </header>

        <div class="grid grid-cols-2 gap-4">
          <Field label="ISBN 10" name="isbn_10" value={book.isbn_10 || ""} />
          <Field label="ISBN 13" name="isbn_13" value={book.isbn_13 || ""} />
        </div>
      </section>
    </div>

    <footer class="mt-8 flex space-x-2">
      <Button type="submit">Save</Button>
      <Button href="/books/{book.id}" subtle>Cancel</Button>
    </footer>
  </form>
</article>
