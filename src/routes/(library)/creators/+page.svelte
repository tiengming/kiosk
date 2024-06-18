<script lang="ts">
  import type { PageData } from './$types';
  import PaginatedList from '$lib/components/Pagination/PaginatedList.svelte';
  import CreatorLink from '$lib/components/Links/CreatorLink.svelte';

  export let data: PageData;
  $: creators = data.creators;
</script>

<article>
  <header class="mb-4">
    <h1 class="text-3xl font-bold font-serif">Creators</h1>
    <p class="mt-1 text-sm text-gray-500">
      On this page, you can discover the creators behind the books in your library.
    </p>
  </header>

  <PaginatedList data={creators} let:items>
    <ul class="grid gap-4 grid-cols-3">
      {#each items as creator}
        <li>
          <CreatorLink {creator} />
        </li>
      {/each}
    </ul>
  </PaginatedList>
</article>
