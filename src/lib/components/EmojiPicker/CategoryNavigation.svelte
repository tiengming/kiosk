<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';
  import { createEventDispatcher } from 'svelte';

  export let groups: Record<string, string>;
  export let active: string;

  const dispatch = createEventDispatcher<{
    input: string;
  }>();

  function activate(group: string) {
    if (active === group) {
      return;
    }

    dispatch('input', group);

    return () => {
      active = group;
    };
  }

  const activeClasses = 'text-blue-500 hover:text-blue-500 ' +
    'dark:text-blue-500 dark:hover:text-blue-500 cursor-default';
  const inactiveClasses = 'hover:text-gray-800 focus-visible:text-gray-800 ' +
    'dark:hover:text-gray-200 dark:focus-visible:text-gray-200';
</script>

<nav class="flex justify-evenly items-center text-gray-500 mb-1">
  {#each Object.entries(groups) as [group, icon]}
    <button
      class="outline-none transition {active === group ? activeClasses : inactiveClasses}"
      on:click={activate(group)}
      tabindex={active === group ? -1 : 0}
    >
      <Icon name={icon} class="text-lg" />
    </button>
  {/each}
</nav>
