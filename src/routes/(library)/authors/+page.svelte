<script lang="ts">
  import { default as AuthorLink } from "$lib/components/Links/Author.svelte";
  import type { PageData } from "./$types";

  export let data: PageData;
</script>

<article>
  <header class="mb-8">
    <h1 class="text-4xl font-bold">Authors</h1>
  </header>

  <ul class="grid gap-4 grid-cols-3">
    {#each data.authors as author}
      <AuthorLink author={author} />
    {/each}
  </ul>
</article>
