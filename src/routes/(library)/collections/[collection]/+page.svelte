<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import IconPicker from '$lib/components/IconPicker.svelte';
  import BookLink from '$lib/components/Links/BookLink.svelte';
  import { savable, trpc } from '$lib/trpc/client';
  import type { PageData } from './$types';
  import Sorting from './Sorting.svelte';
  import { page } from '$app/stores';
  import Icon from '$lib/components/Icon.svelte';
  import CommentsPanel from '$lib/components/Comments/CommentsPanel.svelte';
  import type { SubmitEvent } from '$lib/components/Comments/CommentForm.svelte';
  import type { ReactionEvent } from '$lib/components/Comments/Comment.svelte';
  import { writable } from 'svelte/store';
  import type { RouterOutputs } from '$lib/trpc/router';

  export let data: PageData;
  $: collection = data.collection;
  $: books = data.books;
  let comments = writable<RouterOutputs['collections']['loadComments']>([]);
  $: data.comments.then(items => {
    comments.set(items);
    loading = false;
  });

  let iconPickerOpen: boolean = false;
  let loading: boolean = true;

  function updateSorting(event: CustomEvent<{ field: string | number }>) {
    const { field } = event.detail;
    console.log('Update sorting to', { field });
  }

  async function updateCollectionIcon(event: CustomEvent<{ value: string }>) {
    const icon = event.detail.value;

    await trpc($page).collections.save.mutate(savable({
      id: collection.id,
      icon
    }));

    await invalidateAll();
  }

  async function refreshComments() {
    loading = true;

    try {
      const result = await trpc($page).collections.loadComments.query($page.params.collection);
      comments.set(result);
    } finally {
      loading = false;
    }
  }

  async function addComment({ detail: { content, reset } }: SubmitEvent) {
    loading = true;

    try {
      await trpc($page).collections.addComment.mutate({
        collection: $page.params.collection,
        content
      });
      await refreshComments();

      // Reset the comment form
      reset();
    } finally {
      loading = false;
    }
  }

  async function addReaction({ detail: { commentId, emoji } }: ReactionEvent) {
    await trpc($page).comments.addReaction.mutate({ commentId, emoji });
    await refreshComments();
  }

  async function removeReaction({ detail: { commentId, emoji } }: ReactionEvent) {
    await trpc($page).comments.removeReaction.mutate({ commentId, emoji });
    await refreshComments();
  }
</script>

<article class="relative min-h-full flex flex-col">
  <header class="mb-8 flex items-center justify-between">
    <IconPicker bind:open={iconPickerOpen} on:change={updateCollectionIcon}>
      <div slot="activator">
        <span class="flex justify-center items-center leading-none rounded-full size-12 p-2
              bg-gray-200 dark:bg-gray-800 text-3xl">
          {collection.emoji}
        </span>
      </div>
    </IconPicker>

    <div class="flex flex-col ml-4">
      <h1 class="leading-none font-serif text-4xl font-medium dark:text-gray-300">
        {collection.name}
      </h1>

      <div class="flex items-center space-x-2 mt-1">
        {#if !collection.shared}
          <span
            class="text-sm font-medium text-red-50 dark:text-red-200 bg-red-400 dark:bg-red-700/75 border-red-500 dark:border-transparent border
          rounded-full px-2 pb-0.5 leading-none shadow shadow-red-300/25 select-none cursor-help"
            title="This collection is private and only visible to you."
          >
            private
          </span>
        {/if}

        {#if collection.age_requirement}
          <span class="text-gray-500 text-sm">
            {collection.age_requirement} years and older
          </span>
        {/if}
      </div>
    </div>

    <div class="actions flex items-center space-x-2 ml-auto">
      <Sorting on:change={updateSorting} />

      <button
        class="hidden md:block p-2 rounded-md leading-none bg-transparent hover:bg-gray-200
        dark:hover:bg-gray-700 focus-visible:bg-gray-200 dark:focus-visible::bg-gray-700 outline-0
        focus-visible:ring-2 transition"
      >
        <Icon name="info" class="" />
      </button>
    </div>
  </header>

  {#if collection.books?.length > 0}
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
  {:else}
    <div class="empty-state flex flex-col justify-center items-center py-32 bg-gray-100
         dark:bg-gray-900 rounded-3xl shadow-inner-sm">
      <h2 class="text-gray-500 font-serif text-3xl">
        This collection doesn't contain any books yet.
      </h2>
      <p class="mt-2 dark:text-gray-300">
        To add books, click &raquo;Add to collection&laquo; on their detail pages or drag them here.
      </p>
    </div>
  {/if}

  <CommentsPanel
    {loading}
    comments={$comments}
    on:submit={addComment}
    on:addReaction={addReaction}
    on:removeReaction={removeReaction}
  />
</article>
