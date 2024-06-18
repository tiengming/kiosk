<script lang="ts">
  import { twMerge } from 'tailwind-merge';

  let className: string | undefined = undefined;
  // noinspection ReservedWordAsName
  export { className as class };

  export let label: string | undefined = undefined;
  export let href: string | undefined = undefined;
  let tag = href ? 'a' : 'button';
  export let type: 'button' | 'submit' = 'button';
  export let disabled: boolean = false;
  export let subtle: boolean = false;
  export let small: boolean = false;
  export let large: boolean = false;
  export let icon: boolean = false;

  const classList = twMerge(
    'px-4 py-2 has-[.icon]:pl-2.5 text-black dark:text-gray-300 font-bold ring-2 ring-gray-200 ' +
    'dark:ring-gray-700 bg-white dark:bg-black hover:bg-gray-100 dark:hover:bg-gray-800 rounded ' +
    'outline-none shadow focus-visible:ring-2 focus-visible:ring-blue-500 ' +
    'focus-visible:active:ring-blue-500 focus-visible:text-blue-950 ' +
    'dark:focus-visible:text-blue-50 active:bg-gray-200 dark:active:bg-gray-800/50 ' +
    'active:ring-gray-300 dark:active:ring-gray-500 disabled:bg-gray-200 disabled:text-gray-400 ' +
    'dark:disabled:bg-gray-800 dark:disabled:ring-gray-800 dark:disabled:text-gray-500 ' +
    'transition select-none',
    small ? 'px-2 py-1 has-[.icon]:pl-1' : undefined,
    large ? 'px-6 py-3 has-[.icon]:pl-4' : undefined,
    subtle
      ? 'bg-transparent hover:bg-gray-100 ring-0 ring-gray-100 hover:ring-2 ' +
      'disabled:ring-gray-200 dark:disabled:ring-gray-800 disabled:ring-2 dark:hover:bg-gray-800 ' +
      'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 shadow-none'
      : undefined,
    icon ? 'flex flex-grow-0 p-1 my-0 rounded-full justify-center items-center w-8 h-8'
      : undefined,
    className
  );
</script>

<svelte:element
  this={tag}
  role={tag === 'button' ? 'button' : 'link'}
  {...{
    href: tag === 'a' ? href : undefined,
    type: tag === 'button' ? type : undefined,
    disabled: tag === 'button' ? disabled : undefined,
  }}
  class={classList}
  {...$$restProps}
  on:click
  on:keyup
  on:keydown
  on:keypress
  on:submit
>
  <div class="flex items-center {large ? '[&_.icon]:mr-2.5' : '[&_.icon]:mr-1.5'}">
    <slot>{label}</slot>
  </div>
</svelte:element>
