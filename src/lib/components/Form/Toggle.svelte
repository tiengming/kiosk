<script lang="ts" context="module">
  export type ToggleEvent = CustomEvent<boolean>;
</script>

<script lang="ts">
  import { createSwitch } from 'svelte-headlessui';
  import { twMerge } from 'tailwind-merge';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{
    change: ToggleEvent['detail'];
  }>();

  let className = '';
  // noinspection ReservedWordAsName
  export { className as class };

  export let id: string | undefined = undefined;
  export let value = true;
  export let disabled: boolean | null | undefined = false;
  export let size: 'small' | 'medium' | 'large' = 'medium';

  const Switch = createSwitch({ label: 'Set Preference', checked: value });

  $: toggleClasses = twMerge(
    {
      'small': 'h-5 w-9',
      'medium': 'h-8 w-14',
      'large': 'h-10 w-20'
    }[size],
    'disabled:bg-gray-300 dark:disabled:bg-gray-600',
    $Switch.checked
      ? 'bg-blue-500 ring-blue-700/50 read-only:bg-blue-300 dark:read-only:bg-blue-600'
      : 'bg-gray-200 dark:bg-gray-700 ring-blue-500/75',
  );
  $: knobClasses = twMerge(
    $Switch.checked ? 'ring-blue-600 dark:ring-blue-400' : 'ring-blue-500 dark:ring-blue-600',
    {
      'small': 'h-4 w-4 shadow',
      'medium': 'h-7 w-7 shadow-md',
      'large': 'w-9 h-9 shadow-lg'
    }[size],
    $Switch.checked
      ? {
        'small': 'translate-x-4',
        'medium': 'translate-x-6',
        'large': 'translate-x-10'
      }[size]
      : {
        'small': 'translate-x-0',
        'medium': 'translate-x-0',
        'large': 'translate-x-0'
      }[size]
  );

  $: Switch.set({ checked: value });
  Switch.subscribe(({ checked }) => {
    dispatch('change', checked);
    value = checked;
  });

  function handleKeydown(event: KeyboardEvent) {
    if (['Left', 'ArrowLeft', 'Down', 'ArrowDown'].includes(event.key)) {
      event.preventDefault();
      Switch.set({ checked: false });
    } else if (['Right', 'ArrowRight', 'Up', 'ArrowUp'].includes(event.key)) {
      event.preventDefault();
      Switch.set({ checked: true });
    }
  }
</script>

<div class="flex flex-col items-center justify-center {className}" {...$$restProps}>
  <button
    class="relative inline-flex shrink-0 cursor-pointer disabled:cursor-default rounded-full
    shadow-inner group border-transparent transition duration-200 ease-in-out outline-none
    focus-visible:ring {toggleClasses}"
    use:Switch.toggle
    on:keydown={handleKeydown}
    {disabled}
    {id}
  >
    <span class="sr-only">Use setting</span>
    <span
      aria-hidden="true"
      class="pointer-events-none inline-block m-0.5 group-focus-visible:ring-6 ease-in-out
      transform rounded-full bg-white dark:bg-gray-950 transition duration-200 {knobClasses}"
    />
  </button>
</div>
