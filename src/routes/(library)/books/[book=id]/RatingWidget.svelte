<script lang="ts">
  import StarRating from '$lib/components/StarRating.svelte';
  import type { MaybePromise } from '$lib/utilities';
  import { page } from '$app/stores';
  import type { Book, Rating } from './+page@(library).svelte';
  import { savable, trpc } from '$lib/trpc/client';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{
    rating: { rating: number };
    view;
  }>();

  let className: string = '';
  // noinspection ReservedWordAsName
  export { className as class };

  export let book: Pick<Book, 'id'>;
  export let ratings: MaybePromise<Rating[]>;
  $: internalRating = Promise.resolve(ratings).then(ratings => {
    const sum = ratings.reduce((sum, { rating }) => sum + rating, 0);
    const { rating } = ratings.find(({ user_id }) => user_id === $page.data.user.id) ?? { rating: undefined };

    return {
      average: sum / ratings.length,
      user: rating
    };
  });

  let loading = false;

  async function updateRating({ detail: { value: rating } }: CustomEvent<{ value: number }>) {
    loading = true;

    try {
      await trpc($page).books.updateRating.mutate(savable({
        bookId: book.id,
        rating
      }));
      dispatch('rating', { rating });
    } finally {
      loading = false;
    }
  }

  function viewAll() {
    dispatch('view');
  }

</script>

{#await internalRating}
  <p>Loading ratings...</p>
{:then { user, average }}
  <div
    class="hover:bg-gray-100 dark:hover:bg-gray-900 focus-within:bg-gray-100 items-center mt-2
    dark:focus-within:bg-gray-900 transition rounded-full py-1 pl-2 pr-1 flex max-w-max group {className}"
    {...$$restProps}
  >
    <StarRating
      disabled={loading}
      class="text-yellow-500 dark:text-yellow-600"
      value={user ?? average}
      max="5"
      on:change={updateRating}
    />

    <button
      class="ml-2 px-3 py-0.5 bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400
      rounded-full opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100
      hover:bg-gray-300 dark:hover:bg-gray-700/75 -translate-x-2 focus-visible:bg-gray-300
      dark:hover:text-gray-300 dark:focus-visible:text-gray-300 dark:focus-visible:bg-gray-700
      focus-visible:ring focus-visible:ring-gray-500 outline-none group-hover:translate-x-0
      group-focus-within:translate-x-0 shadow-sm"
      on:click={viewAll}
    >
      View all
    </button>
  </div>
{/await}
