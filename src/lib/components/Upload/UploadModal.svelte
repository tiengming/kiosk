<script lang="ts">
  import Dropzone from '$lib/components/Form/Dropzone.svelte';
  import Modal from '$lib/components/Modal.svelte';
  import BookDataForm from '$lib/components/Upload/BookDataForm.svelte';
  import type { WebWorker, WorkerMessage } from '$lib/workers/workers';
  import { loadWorker } from '$lib/workers/workers';
  import { onDestroy, onMount } from 'svelte';

  type FileRequestMessage = {
    content: string;
  }
  type FileResponse = {
    status: boolean;
    metadata: Record<string, string>;
    cover: string;
  }

  export let open: boolean = false;
  export let file: File | undefined = undefined;

  let worker: WebWorker<WorkerMessage<'epub', FileRequestMessage>, WorkerMessage<'epub', FileResponse>> | undefined;
  let metadata: Record<string, string> | undefined = undefined;
  let cover: string | undefined = undefined;
  let loading: boolean = false;

  async function processBook() {
    console.log('processing book');
    loading = true;

    if (!file) {
      return;
    }

    const payload: Omit<FileRequestMessage['payload'], 'content'> = {
      lastModified: new Date(file.lastModified),
      name: file.name,
      size: file.size,
      type: file.type
    };

    // Safari is unable to transfer streams, despite the standards allowing this
    const content = 'safari' in window
      ? await file.arrayBuffer()
      : file.stream();

    // noinspection TypeScriptValidateTypes
    return worker?.postMessage({
      type: 'epub',
      payload: { ...payload, content }
    } as FileRequestMessage, [content]);
  }

  onMount(async () => {
    worker = await loadWorker<WorkerMessage<'epub', FileRequestMessage>, WorkerMessage<'epub', FileResponse>>(import('$lib/workers/epub.worker?worker'));

    worker.onmessage = async ({ data }) => handleWorkerMessage(
      data.type,
      data.payload
    );
  });

  onDestroy(() => worker?.terminate());

  async function handleWorkerMessage(type: string, payload: FileResponse) {
    switch (type) {
      case 'file':
        metadata = payload.metadata;
        cover = payload.cover;
        loading = false;
        break;

      default:
        console.log(`Unhandled message type ${type}`);
    }
  }

  function reset() {
    file = undefined;
    metadata = undefined;
    cover = undefined;
    loading = false;
    open = false;
  }

  function close() {
    open = false;
  }

  let fileChangeTriggered = false;

  $: if (!fileChangeTriggered && file && !loading) {
    fileChangeTriggered = true;
    processBook();
  }
</script>

<Modal bind:open={open}>
  <div slot="header">
    <h1 class="text-4xl font-bold mb-8 md:mb-4 text-black dark:text-gray-300">Add new book</h1>
  </div>

  <div class="flex flex-grow h-full flex-col w-screen min-h-[70vh] md:min-h-[60vh] max-w-full relative">
    {#if !file}
      <Dropzone accept="application/epub+zip" bind:file={file} on:load={processBook}>
        <span slot="placeholder" class="text-gray-500">Drag a book here, or click to select one</span>
      </Dropzone>
    {:else if loading}
      <div class="flex justify-center items-center h-full">
        <span class="text-xl text-gray-500">
          Hang tight, your book is being analyzed…
        </span>
      </div>
    {:else if !loading && metadata}
      <BookDataForm bind:file={file} bind:cover={cover} bind:data={metadata} on:submit={reset} on:cancel={close} />
    {/if}
  </div>
</Modal>
