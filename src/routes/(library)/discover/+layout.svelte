<script lang="ts" context="module">
  import type { PageData } from './$types';

  export type Catalog = Awaited<PageData['catalogs']>[number];
</script>

<script lang="ts">
  import ContentSection from '$lib/components/ContentSection.svelte';
  import CatalogNavigation from './CatalogNavigation.svelte';

  export let data: PageData;
  $: catalogs = data.catalogs;
</script>

<ContentSection padding>
  <div class="relative flex items-stretch">
    <CatalogNavigation {catalogs} />

    <div class="w-4/5 shrink-0 ml-8">
      <slot />
    </div>
  </div>
</ContentSection>
