<script lang="ts">
  import { page } from "$app/stores";

  let status: number;
  $: status = $page.status ?? 500;
  $: message = $page.error?.message;
</script>

<article class="error p-16">
  <header class="mb-8">
    <h1 class="text-5xl font-bold">An error occurred</h1>
    <span class="text-2xl">{status}: {message}</span>
  </header>

  <p>Uh-oh, this shouldn't have happened.</p>
</article>

