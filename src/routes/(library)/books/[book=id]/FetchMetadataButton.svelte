<script lang="ts">
  import { loadWorker } from '$lib/workers/workers';
  import { onDestroy, onMount } from 'svelte';
  import type { Book, Creator } from './+page@(library).svelte';
  import type { BookMetadataWorker } from '$lib/workers/book-metadata.worker';
  import type { MaybePromise } from '$lib/utilities';

  export let book: MaybePromise<Book>;
  export let creators: MaybePromise<Creator[]>;

  let worker: BookMetadataWorker;

  async function loadMetadata() {
    const payload = {
      ...await book,
      creators: await creators
    };

    worker.postMessage({ type: 'loadMetadata', payload });
  }

  onMount(async () => {
    worker = await loadWorker<BookMetadataWorker>(import('$lib/workers/book-metadata.worker?worker'));
    worker.onmessage = (event) => {
      console.log('Received message from worker:', event);
    };
  });

  // TODO: We probably don't want to terminate the worker on destroy. If it's still trying to
  //       fetch data, we should let it finish. We should probably have a way to cancel the fetch.
  onDestroy(() => worker?.terminate());
</script>

<button on:click={loadMetadata}>
  Load metadata
</button>
