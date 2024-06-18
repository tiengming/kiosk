<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import HeaderNavLink from '$lib/components/HeaderNavLink.svelte';
  import AddCollectionForm from '$lib/components/Sidebar/AddCollectionForm.svelte';
  import type { Collection } from '$lib/server/data/collection';
  import Icon from '$lib/components/Icon.svelte';
  import type { MaybePromise } from '$lib/utilities';
  import LoadingSpinner from '$lib/LoadingSpinner.svelte';

  export let collections: MaybePromise<Collection[]> = [];
  let adding: boolean = false;

  function handleAdd() {
    adding = true;
  }

  async function handleAdded(event: CustomEvent<{ created: boolean }>) {
    const { created } = event.detail;

    adding = false;

    if (created) {
      await invalidateAll();
    }
  }
</script>

<ul class="flex flex-col px-4 mt-4 md:my-8 space-y-4">
  <li class="mb-4 md:mb-1 pl-2 border-b md:border-none">
    <span class="hidden md:inline text-gray-600 text-sm font-bold">Collections</span>
  </li>

  {#await collections}
    <div class="px-3 flex items-center">
      <LoadingSpinner size={16} />
      <span class="ml-2 text-gray-500">Loading collections…</span>
    </div>
  {:then collections}
    {#each collections as collection}
      <HeaderNavLink
        to="/collections/{collection.id}"
        title={collection.name}
        emoji={collection.emoji}
      >
        <div class="flex w-full items-center justify-between">
          <span>{collection.name}</span>

          {#if !collection.shared}
            <Icon
              name="visibility_off"
              class="text-gray-400 dark:text-gray-600 text-lg group-aria-[current=page]/link:text-gray-400"
            />
          {/if}
        </div>
      </HeaderNavLink>
    {/each}
  {/await}

  {#if adding}
    <li class="mb-1 pl-2">
      <AddCollectionForm on:done={handleAdded} />
    </li>
  {/if}

  <HeaderNavLink title="New collection" icon="add" on:click={handleAdd} />
</ul>
