<script lang="ts">
  import Sidebar from '$lib/components/Sidebar/Sidebar.svelte';
  import UploadModal from '$lib/components/Upload/UploadModal.svelte';
  import type { AuthData } from '../+layout.server';
  import type { LayoutData } from './$types';
  import { preference, theme } from '$lib/actions/theme';
  import UploadOverlay from '$lib/components/Upload/UploadOverlay.svelte';

  export let data: LayoutData & AuthData;

  let uploadModalOpen: boolean = false;

  $: $preference = data.user?.color_scheme || 'system';

  function showUploadModal() {
    uploadModalOpen = true;
  }


</script>

<svelte:body use:theme />

<main>
  <div class="flex flex-grow">
    <Sidebar
      class="md:w-1/5"
      collections={data.collections}
      user={data.user}
      on:upload={showUploadModal}
    />

    <div class="w-4/5 bg-white dark:bg-gray-950 border-l border-gray-200 dark:border-gray-800">
      <slot />
    </div>
  </div>
</main>

{#if data.isAuthenticated}
  <UploadOverlay />

  <UploadModal bind:open={uploadModalOpen} />
{/if}
