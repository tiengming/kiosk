<script lang="ts">
  import type { MaybePromise } from '$lib/utilities';
  import type { Catalog } from './+page.svelte';
  import Button from '$lib/components/Form/Button.svelte';
  import AddCatalogModal from './AddCatalogModal.svelte';
  import { type PaginationData, trpc } from '$lib/trpc/client';
  import { page } from '$app/stores';
  import CatalogListItem, { type DisableCatalogEvent, type EnableCatalogEvent } from './CatalogListItem.svelte';
  import PaginatedList from '$lib/components/Pagination/PaginatedList.svelte';

  let data: MaybePromise<[Catalog[], PaginationData]>;
  $: data = $page.data.catalogs;
  let catalogModalOpen = false;
  let catalogsLoading: Catalog['id'][] = [];

  async function enableCatalog({ detail: { catalog } }: EnableCatalogEvent) {
    catalogsLoading.push(catalog.id);

    try {
      await trpc($page).catalogs.enable.mutate({
        id: catalog.id
      });
    } finally {
      catalogsLoading = catalogsLoading.filter((id) => id !== catalog.id);
    }
  }

  async function disableCatalog({ detail: { catalog } }: DisableCatalogEvent) {
    catalogsLoading.push(catalog.id);

    try {
      await trpc($page).catalogs.disable.mutate({
        id: catalog.id
      });
    } finally {
      catalogsLoading = catalogsLoading.filter((id) => id !== catalog.id);
    }
  }

  function isLoading(catalog: Catalog) {
    return catalogsLoading.includes(catalog.id);
  }

  function showCatalogModal() {
    catalogModalOpen = true;
  }
</script>

<section>
  <header class="mb-8 md:mb-4 flex flex-col md:flex-row items-center justify-between">
    <div>
      <h3 class="text-3xl font-bold font-serif mb-2">Catalogs</h3>
      <p class="text-gray-700 dark:text-gray-400">
        Here you can find all the catalogs that are available in the system.
      </p>
    </div>

    <Button on:click={showCatalogModal} class="mt-4 md:mt-0 mr-auto md:mr-0">
      Add new catalog
    </Button>
  </header>

  <PaginatedList {data} let:items>
    <ul class="space-y-4">
      {#each items as catalog}
        <CatalogListItem
          {catalog}
          disabled={isLoading(catalog)}
          on:enable={enableCatalog}
          on:disable={disableCatalog}
        />
      {/each}
    </ul>
  </PaginatedList>
</section>

<AddCatalogModal bind:open={catalogModalOpen} />
