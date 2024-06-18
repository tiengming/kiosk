<script lang="ts" context="module">
  import type { RouterOutputs } from '$lib/trpc/router';

  type Collection = RouterOutputs['collections']['list'][number];
</script>

<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import Modal from '$lib/components/Modal.svelte';
  import { savable, trpc } from '$lib/trpc/client';
  import type { Book } from '$lib/server/data/book';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';

  export let open: boolean = false;
  export let loading: boolean = false;
  export let book: Pick<Book, 'id'>;
  let collections: Collection[] = [];

  async function loadCollections() {
    loading = true;

    try {
      collections = await trpc($page).collections.list.query();
    } finally {
      loading = false;
    }
  }

  function addToCollection({ id }: Collection) {
    return async () => {
      loading = true;

      try {
        await trpc($page).collections.toggleBook.mutate(savable({
          collection: id,
          book: book.id
        }));
        await Promise.all([
          loadCollections(),
          invalidateAll()
        ]);
      } finally {
        loading = false;
      }
    };
  }

  onMount(loadCollections);
</script>

<Modal bind:open={open}>
  <header slot="header" class="mb-4">
    <h2 class="font-bold">Collections</h2>
  </header>

  <ul class="w-96">
    {#each collections as collection}
      {@const entries = Number(collection.entry_count)}
      <li>
        <button
          class="w-full flex items-center justify-between p-2 rounded-md cursor-pointer
          hover:bg-gray-100 focus-visible:bg-gray-100 dark:hover:bg-gray-800 outline-none transition
          dark:focus-visible:bg-gray-800 focus-visible:ring"
          on:click={addToCollection(collection)}
        >
          <span class="mr-2">{collection.emoji}</span>
          <span class="mr-auto">{collection.name}</span>
          <span class="ml-4 text-gray-500 text-sm">
            {#if entries === 0}
              No books yet
              {:else if entries === 1}
              One book
              {:else if entries === 2}
              Two books
              {:else if entries === 3}
              Three books
              {:else}
                {entries} books
              {/if}
          </span>
        </button>
      </li>
    {/each}
  </ul>
</Modal>
