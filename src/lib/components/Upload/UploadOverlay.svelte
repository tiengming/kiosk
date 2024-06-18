<script lang="ts">
  import QueueStatusWidget from '$lib/components/Upload/QueueStatusWidget.svelte';
  import { queue, resume, supportedUploadFormats, upload } from '$lib/uploads';
  import { onMount } from 'svelte';

  const allowedMimeTypes = supportedUploadFormats.flatMap(format => Array.from(new Set(Object.keys(format.accept))));

  let showDragOverlay = false;
  $: pendingUploads = $queue.length > 0;

  onMount(() => {
    if (pendingUploads) {
      resume();
    }
  });

  function handleDragEnter(event: DragEvent) {
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }

    showDragOverlay = true;
  }

  async function handleDrop(event: DragEvent) {
    showDragOverlay = false;

    if (!event.dataTransfer?.files || event.dataTransfer.files.length === 0) {
      return;
    }

    const files = Array
      .from(event.dataTransfer.files)

      // Remove obviously invalid file types to avoid unnecessary work. If the type cannot be
      // inferred by the browser, it will be an empty string; in these cases, we defer the decision
      // to the worker to avoid blocking the main thread.
      .filter(({ type }) => !type || allowedMimeTypes.includes(type));

    // TODO: Show some kind of notification if no valid files are uploaded
    console.log('Uploading files', { files });

    if (files.length > 0) {
      await upload(files);
    }
  }

  function handleDragLeave(event: DragEvent & { fromElement?: HTMLElement | null }) {
    if (event.fromElement !== null) {
      return;
    }

    event.stopPropagation();
    showDragOverlay = false;
  }

  function continueDragging(event: DragEvent) {
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
  }
</script>

<svelte:window
  on:dragenter={handleDragEnter}
  on:dragleave={handleDragLeave}
  on:dragexit={handleDragLeave}
  on:dragover|preventDefault={continueDragging}
  on:drop|preventDefault={handleDrop}
/>

<div id="drag-overlay"
     class="fixed w-full h-full top-0 left-0 flex p-8 bg-blue-500/25 backdrop-blur-xl
     backdrop-saturate-200 z-50 transition"
     class:opacity-0={!showDragOverlay}
     class:pointer-events-none={!showDragOverlay}
     class:opacity-100={showDragOverlay}
>
  <div
    class="w-full h-full flex justify-center items-center border-4 border-white border-dashed
    rounded-3xl animate-breathe"
  >
    <span class="text-white text-3xl drop-shadow-md">Drop books here to upload</span>
  </div>
</div>

{#if pendingUploads}
  <QueueStatusWidget />
{/if}
