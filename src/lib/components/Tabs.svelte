<script context="module" lang="ts">
  import { type Writable } from 'svelte/store';

  export interface TabsContext {
    disabled: boolean;
    selected: Writable<HTMLElement | null>;
    classes?: string;
  }
</script>

<script lang="ts">
  import type { Action } from 'svelte/action';
  import { setContext } from 'svelte';
  import { writable } from 'svelte/store';

  export let disabled: boolean = false;
  export let divider: boolean = true;
  export let grow: boolean = false;
  const context: TabsContext = {
    disabled,
    selected: writable<HTMLElement | null>(null),
    classes: grow ? 'flex-grow' : '',
  };

  setContext('tabs', context);

  const tabs: Action = function tabs(node) {
    const destroy = context.selected.subscribe((child) => {
      if (child) {
        node.replaceChildren(child);
      }
    });

    return { destroy };
  };
</script>

<ul role="tablist" class="flex items-center" class:pointer-events-none={disabled}>
  <slot />
</ul>

{#if divider}
  <slot name="divider">
    <div class="h-px -mt-px bg-gray-200 dark:bg-gray-700" />
  </slot>
{/if}

<div class="mt-4" role="tabpanel" aria-labelledby="id-tab" use:tabs />
