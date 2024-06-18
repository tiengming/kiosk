<script lang="ts" context="module">
  export type EmojiPickerInputEvent = CustomEvent<{ emoji: string }>;
</script>

<script lang="ts">
  import Field from '$lib/components/Form/Field.svelte';
  import { slide } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import CategoryNavigation from '$lib/components/EmojiPicker/CategoryNavigation.svelte';
  import { emoji as items, type GroupName } from './emoji';
  import { createEventDispatcher } from 'svelte';
  import { addRecentlyUsedEmoji, recent } from '$lib/components/EmojiPicker/recent';

  const dispatch = createEventDispatcher<{
    input: EmojiPickerInputEvent['detail'];
  }>();

  export let active = false;
  let panel: HTMLElement;
  let activeGroup: GroupName = 'recent';
  const groups: Record<GroupName, string> = {
    'recent': 'schedule',
    'people': 'person',
    'nature': 'eco',
    'food': 'lunch_dining',
    'activity': 'sports_basketball',
    'travel': 'flight',
    'objects': 'lightbulb',
    'symbols': 'favorite',
    'flags': 'flag'
  };

  $: activeGroupEmoji = activeGroup === 'recent'
    ? $recent
    : items[activeGroup];

  function activate() {
    active = true;
  }

  function close() {
    active = false;
  }


  function pick(emoji: string) {
    return () => {
      dispatch('input', { emoji });
      addRecentlyUsedEmoji(emoji);
      close();
    };
  }

  function handleFocus(event: FocusEvent) {
    const target = event.target as HTMLElement;

    if (!active || !panel) {
      return;
    }

    if (target instanceof Node && panel.contains(target)) {
      return;
    }

    close();
  }

  function handleMousedown(event: MouseEvent) {
    const target = event.target as HTMLElement;

    if (!active || !(target instanceof Node) || panel.contains(target)) {
      return;
    }

    close();
  }

  function handleKeydown(event: KeyboardEvent) {
    if (!active) {
      return;
    }

    if (event.key === 'Escape') {
      close();
    }

    if ([
      'ArrowUp',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight'
    ].includes(event.key)) {
      event.preventDefault();

      // To pull this off, we'll need to organize the items in a grid
      // of known dimensions, so we can figure out the next item to focus.
      console.warn('TODO: Implement arrow navigation for emoji');
    }
  }
</script>

<div class="relative group/picker">
  {#if active}
    <article
      transition:slide={{ duration: 125, easing: quintOut }}
      bind:this={panel}
      class="absolute top-full left-0 -ml-4 mt-2 w-96 bg-white/75 backdrop-blur-3xl backdrop-saturate-200
      dark:bg-black shadow-xl rounded-3xl z-40 dark:ring dark:ring-gray-800 dark:ring-opacity-50"
    >
      <header class="pt-2 px-4">
        <CategoryNavigation {groups} bind:active={activeGroup} />
        <Field placeholder="Search" />
      </header>

      <div class="relative h-48 overflow-y-auto pt-2 px-4">
        <ul class="grid grid-cols-8 gap-1">
          {#each activeGroupEmoji as emoji}
            <li class="contents">
              <button
                class="w-10 h-10 flex justify-center items-center rounded-lg hover:bg-gray-100
                dark:hover:bg-gray-800 transition outline-none focus-visible:shadow
                focus-visible:bg-blue-50 dark:focus-visible:bg-blue-950/75 focus-visible:ring-primary-500 focus-visible:ring"
                on:click={pick(emoji)}
              >
                <span class="text-2xl">{emoji}</span>
              </button>
            </li>
          {/each}
        </ul>
      </div>
    </article>
  {/if}

  <slot {activate} {active} />
</div>

<svelte:window
  on:focus|capture={handleFocus}
  on:mousedown={handleMousedown}
  on:keydown={handleKeydown}
/>
