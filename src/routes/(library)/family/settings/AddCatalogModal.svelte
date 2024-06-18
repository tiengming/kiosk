<script lang="ts">
  import Modal from '$lib/components/Modal.svelte';
  import Field from '$lib/components/Form/Field.svelte';
  import Button from '$lib/components/Form/Button.svelte';
  import { fade } from 'svelte/transition';
  import { trpc } from '$lib/trpc/client';
  import { page } from '$app/stores';
  import LoadingSpinner from '$lib/LoadingSpinner.svelte';
  import type { RouterOutputs } from '$lib/trpc/router';
  import Icon from '$lib/components/Icon.svelte';

  export let open: boolean = false;
  let error: string | undefined = undefined;
  let loading = false;

  let feedUrl: string = '';
  $: parsedUrl = parseUrl(feedUrl);
  let title = '';
  let description = '';
  let imageUrl: string | undefined = undefined;
  let result: RouterOutputs['catalogs']['fetchRemoteCatalog'] | undefined = undefined;
  $: validCatalogUrl = typeof parsedUrl !== 'undefined';
  $: validCatalog = validCatalogUrl && result;

  async function handlePastedUrl() {
    await new Promise(resolve => setTimeout(resolve, 1));

    if (!validCatalogUrl) {
      return;
    }

    return loadCatalog();
  }

  async function loadCatalog() {
    if (!validCatalogUrl || loading) {
      return;
    }

    loading = true;
    error = undefined;

    try {
      result = await trpc($page).catalogs.fetchRemoteCatalog.query({ feedUrl });
    } catch (err) {
      console.error('Failed to fetch catalog:', err);
      error = err instanceof Error ? err.message : `Loading the catalog failed: ${error}`;
    } finally {
      loading = false;
    }

    title = result?.title ?? '';
    imageUrl = result?.imageUrl;
    description = result?.description ?? '';
  }

  async function addCatalog() {
    loading = true;

    try {
      await trpc($page).catalogs.addCatalog.mutate({
        feedUrl,
        title,
        description,
        imageUrl
      });
      open = false;
    } catch (err) {
      console.error('Failed to add catalog:', err);
      error = err instanceof Error ? err.message : `Adding the catalog failed: ${error}`;
    } finally {
      loading = false;
    }
  }

  function parseUrl(url: string) {
    try {
      return new URL(url);
    } catch (e) {
      return undefined;
    }
  }
</script>

<Modal bind:open class="max-w-96">
  <h1 slot="header" class="font-bold text-lg">Add a new catalog</h1>

  <p class="text-sm text-gray-600 dark:text-gray-400">
    Add a new OPDS catalog to Kiosk. A catalog provides a way to browse and download books from a
    specific source, like a library or a bookstore. You can add a catalog by providing its OPDS
    feed URL. Kiosk will regularly fetch the feed and display the books in the <em>Discover</em>
    section.<br>
    If you're not sure how this works, take a look at
    the&nbsp;<a class="underline" href="/help/catalogs">catalog&nbsp;documentation</a>.
  </p>

  <div class="grid grid-cols-[auto_min-content] items-center gap-4 mt-4">
    <Field
      label="OPDS feed URL"
      name="feed"
      class="col-span-2"
      type="url"
      required
      bind:value={feedUrl}
      on:paste={handlePastedUrl}
    />

    {#if validCatalog}
      <Field label="Catalog Title" name="feed" type="text" required bind:value={title} />

      <div class="bg-white h-10 w-10 rounded-full border flex justify-center items-center">
        {#if imageUrl}
          <img src={imageUrl} class="w-8 h-auto object-cover overflow-hidden rounded-full"
               alt="Logo of the catalog feed of {title}" />
        {:else}
          <Icon name="local_library" class="text-gray-500 dark:text-gray-400" />
        {/if}
      </div>

      <Field
        class="col-span-2"
        label="Description"
        name="feed"
        type="text"
        required
        bind:value={description}
      />
    {/if}
  </div>

  {#if error}
    <div
      class="bg-red-50 rounded-lg p-2 mt-2 text-sm ring ring-red-200 shadow-sm shadow-red-500/25"
      transition:fade={{ delay: 50, duration: 100 }}
    >
      <strong class="text-red-700">⚠️ Could not fetch catalog</strong>
      <p class="text-red-900">{error}</p>
    </div>
  {/if}

  <footer class="mt-4 flex items-center">
    {#if validCatalog}
      <Button on:click={addCatalog} disabled={loading}>
        Add catalog
      </Button>
    {:else}
      <Button on:click={loadCatalog} disabled={!validCatalogUrl || loading}>
        Fetch catalog
      </Button>
    {/if}

    {#if loading}
      <LoadingSpinner class="ml-auto" />
    {/if}
  </footer>
</Modal>
