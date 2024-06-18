<script lang="ts">
  import BookCover from '$lib/components/BookCover.svelte';

  export let book: string;
  export let edition: string;
  export let title: string;
  export let blurhash: string | undefined | null=undefined;
</script>

<a href="/books/{book}" class="contents">
  <article class="flex flex-col justify-between h-full">
    <header class="contents">
      <BookCover
        {book}
        {edition}
        {title}
        {blurhash}
        class="mb-2 hover:scale-[1.02] transition-transform shadow-lg"
        imageClasses="aspect-[50/81] object-cover"
      />
      <h3 class="mt-auto font-medium text-center font-serif text-base text-black dark:text-gray-200">
        {title}
      </h3>
    </header>
  </article>
</a>
