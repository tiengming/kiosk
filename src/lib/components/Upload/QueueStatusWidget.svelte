<script lang="ts">
  import LoadingSpinner from '$lib/LoadingSpinner.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import { fade } from 'svelte/transition';

  let paused = false;

  function pause() {
    paused = !paused;
  }
</script>

<div
  class="fixed bottom-0 right-0 p-8"
  transition:fade={{duration: 150}}
  aria-live="polite"
  role="status"
>
  <div
    class="flex items-center p-2 shadow-lg rounded-xl border bg-white dark:bg-gray-800
    dark:border-gray-700 dark:shadow-blue-500/10 group"
  >
    <LoadingSpinner size={24} class="group/spinner" {paused}>
      <button
        type="button"
        class="opacity-0 group-hover:opacity-50 group-hover/spinner:opacity-100
        group-focus-visible:opacity-50 aria-pressed:opacity-100
        focus-visible:opacity-100 outline-none transition leading-none mt-0.5"
        on:click={pause}
        aria-pressed={paused}
        aria-controls="upload-operation-status"
      >
        <Icon name="pause" class="text-sm text-blue-100 leading-none" fill />
      </button>
    </LoadingSpinner>
    <span
      class="relative min-w-min ml-3 mr-2 text-sm dark:text-gray-400 select-none"
      id="upload-operation-status"
    >
      <span class="{paused ? 'opacity-0' : 'opacity-100'}">Uploading Books…</span>
      <span class="absolute top-0 left-0 {!paused ? 'opacity-0' : 'opacity-100'}">Upload paused…</span>
    </span>
  </div>
</div>
