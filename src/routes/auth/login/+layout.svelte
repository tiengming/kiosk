<script lang="ts">
  import type { LayoutData } from './$types';
  import PageHeader from '$lib/components/Page/PageHeader.svelte';

  export let data: LayoutData;

  let error: string | undefined = undefined;

  $: {
    error = 'error' in data && typeof data.error === 'string'
      ? data.error
      : undefined;
  }
</script>

<slot />

{#if error}
  <div class="mt-4 text-red-500">
    <div class="flex flex-col">
      <span>{error}</span>
    </div>
  </div>
{/if}
