<script lang="ts">
  import { twMerge } from 'tailwind-merge';

  export let label: string;
  export let active: boolean = false;
  export let disabled: boolean = false;

  const classList = twMerge(
    'w-8 h-8 flex justify-center items-center rounded-full leading-none p-2 transition ' +
    'group-first/pagination:ml-0 group-last/pagination:mr-0 mx-0.5',
    active
      ? 'font-bold bg-black text-white dark:text-gray-300 shadow-lg'
      : 'disabled:opacity-50 dark:disabled:opacity-25 disabled:pointer-events-none hover:bg-gray-200 dark:hover:bg-gray-800'
  );
</script>

<button
  aria-current={active ? 'true' : 'false'}
  type="button"
  {disabled}
  class={classList}
  aria-label={label}
  on:click
  on:keydown
  on:keyup
  on:keypress
  {...$$restProps}
>
  <slot />
</button>
