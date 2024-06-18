<script lang="ts">
  import type { Catalog } from './+layout.svelte';
  import type { MaybePromise } from '$lib/utilities';

  export let catalogs: MaybePromise<Catalog[]>;
</script>

<nav class="w-1/5 mt-16 py-2">
  {#await catalogs}
    <span class="text-sm text-gray-500">Loading catalogs…</span>
  {:then catalogs}
    <ul class="flex flex-col space-y-1">
      {#each catalogs as catalog}
        <li>
          <a
            href="/discover/{catalog.id}/{catalog.slug}"
            class="px-2 py-1 hover:bg-gray-100 text-sm text-gray-700 transition rounded block
            outline-none focus-visible:ring focus-visible:bg-gray-100"
          >
            <span>{catalog.title}</span>
          </a>
        </li>
      {/each}
    </ul>
  {/await}
</nav>
