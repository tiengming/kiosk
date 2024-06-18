<script lang="ts">
  export let emoji: string;
  export let count: number;
  export let active: boolean = false;
</script>

<button
  class="flex items-center rounded-full cursor-pointer
  transition hover:ring focus-visible:ring active:ring-blue-700 outline-none px-1 py-0.5
  {active
    ? 'bg-blue-300 dark:bg-blue-800 dark:hover:bg-blue-800/75'
    : 'bg-gray-200 dark:bg-gray-800 dark:hover:bg-blue-950'
  }"
  class:pr-1.5={count > 0}
  on:click
>
  <span class="text-lg leading-none">{emoji}</span>
  <span
    class="text-xs text-gray-600 dark:text-gray-400 transition ease-in-out {count === 0
      ? '-translate-x-4 w-0 opacity-0'
      : 'ml-1'
    }"
  >
    {count}
  </span>
</button>
