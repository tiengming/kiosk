<script lang="ts">
  import { createEventDispatcher, getContext } from 'svelte';
  import type { TabsContext } from '$lib/components/Tabs.svelte';
  import { writable } from 'svelte/store';
  import type { Action } from 'svelte/action';
  import { twMerge } from 'tailwind-merge';

  export let open: boolean = false;
  export let disabled: boolean = false;
  export let title: string = '';

  const context = getContext<TabsContext>('tabs') ?? {};
  const selected = context.selected || writable<HTMLElement>();
  $: isDisabled = disabled || context.disabled || false;
  $: selectable = !isDisabled && !open;

  const dispatch = createEventDispatcher<{
    activate;
  }>();

  const tab: Action = function tab(node: HTMLElement) {
    selected.set(node);

    const destroy = selected.subscribe((child) => {
      if (child !== node) {
        open = false;
      }
    });

    return { destroy };
  };

  function openTab() {
    open = true;
    dispatch('activate');
  }

  $: classes = twMerge(
    'mx-2 group-first:ml-0 group-last:mr-0 px-0.5 py-2 border-b-2 border-transparent '+
    'focus:outline-none transition hover:border-b-blue-500/50 focus-visible:border-b-blue-500/50',
    context.classes,
    open ? 'border-b-blue-500 hover:border-b-blue-500' : 'border-b-transparent',
    isDisabled ? 'opacity-50' : '',
    open && isDisabled ? 'border-b-gray-500' : ''
  );
</script>

<li role="presentation" class="contents group">
  <button
    type="button"
    on:click={openTab}
    disabled={!selectable}
    tabindex={selectable ? 0 : -1}
    on:blur
    on:click
    on:contextmenu
    on:focus
    on:keydown
    on:keypress
    on:keyup
    on:mouseenter
    on:mouseleave
    on:mouseover
    role="tab"
    class={classes}
    {...$$restProps}
  >
    <slot name="title">{title}</slot>
  </button>

  {#if open}
    <div class="hidden tab_content_placeholder">
      <div use:tab>
        <slot />
      </div>
    </div>
  {/if}
</li>
