<script lang="ts">
  import { createEventDispatcher, onDestroy } from 'svelte';
  import Portal from '$lib/components/Portal.svelte';
  import { clickOutside } from '$lib/utilities';
  import { browser } from '$app/environment';
  import Icon from '$lib/components/Icon.svelte';

  let className = '';
  // noinspection ReservedWordAsName
  export { className as class };
  export let open: boolean = false;
  let dialog: HTMLDialogElement;
  $: {
    if (browser) {
      window.document.body.style.overflow = open ? 'hidden' : '';

      if (open) {
        dialog?.showModal();
      } else {
        dialog?.close();
      }
    }
  }

  const dispatch = createEventDispatcher<{ 'close' }>();

  if (typeof document !== 'undefined') {
    onDestroy(() => {
      window.document.body.style.overflow = '';

      if (window.document.activeElement) {
        (window.document.activeElement as HTMLElement).focus();
      }
    });
  }

  function handleKeydown(event: KeyboardEvent) {
    if (!open || !dialog) {
      return;
    }

    const { key } = event;

    if (key === 'Escape') {
      return close();
    }

    if (key === 'Tab') {
      // trap focus
      // eslint-disable-next-line no-undef -- for some reason eslint doesn't recognize NodeListOf
      const nodes = dialog.querySelectorAll('*') as NodeListOf<HTMLElement>;
      const tabbable = Array.from(nodes).filter(n => n.tabIndex >= 0);

      let index = window.document.activeElement
        ? tabbable.indexOf(window.document.activeElement as HTMLElement)
        : -1;

      if (index === -1 && event.shiftKey) {
        index = 0;
      }

      index += tabbable.length + (event.shiftKey ? -1 : 1);
      index %= tabbable.length;

      tabbable[index]?.focus();
      event.preventDefault();
    }
  }

  export function close() {
    open = false;
    dispatch('close');
  }

  //
  // if (import.meta.hot) {
  //   import.meta.hot.accept(() => {
  //     close();
  //   });
  // }
</script>

<svelte:window on:keydown={handleKeydown} />

<Portal>
  <dialog
    bind:this={dialog}
    class="mt-[5vh] rounded-3xl backdrop:bg-black/30 will-change-auto bg-white dark:bg-gray-950
    dark:text-gray-100 dark:backdrop:bg-white/5 backdrop:backdrop-blur backdrop:pointer-events-none
    max-h-[calc(100%_-_5vh_-_2rem)] max-w-[calc(100%_-_4rem)] shadow-xl
    transparency-reduce:backdrop:backdrop-blur-0 transparency-reduce:backdrop:bg-white
    transparency-reduce:dark:backdrop:bg-black"
    style:transform="translate3d(0,0,0)"
    use:clickOutside
    on:clickOutside={close}
  >
    <header
      class="flex items-center justify-between sticky top-0 z-10 bg-white/80 dark:bg-black/70
      pl-4 pr-2 pt-2 pb-1 border-b dark:border-b-gray-900 shadow-sm backdrop-blur min-w-72"
    >
      <div>
        <slot name="header" />
      </div>

      <button
        type="button"
        aria-label="Close the dialog"
        on:click={close}
        class="flex justify-center items-center bg-gray-50 p-2 dark:bg-black/20 hover:bg-gray-100
        dark:hover:bg-black/60 transition rounded-full outline-none focus-visible:ring-2 ring-blue-500"
      >
        <Icon name="close" class="leading-none" />
      </button>
    </header>

    <div class="flex flex-col max-h-full overflow-y-auto will-change-scroll p-6 {className}">
      <slot />
    </div>
  </dialog>
</Portal>
