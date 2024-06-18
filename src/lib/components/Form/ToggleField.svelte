<script lang="ts">
  import Field from '$lib/components/Form/Field.svelte';
  import Toggle from '$lib/components/Form/Toggle.svelte';
  import { twMerge } from 'tailwind-merge';

  let className = '';
  // noinspection ReservedWordAsName
  export { className as class };
  export let value: boolean = false;
  export let label: string = '';
  export let readonly: boolean = false;

  const classList = twMerge(
    'bg-transparent dark:bg-transparent ring-0 shadow-none focus-within:ring-0 ' +
    'focus-within:shadow-none aria-disabled:bg-transparent',
    className
  );
</script>

<Field {label} {readonly} {...$$restProps} class={classList}>
  <span
    class="grow shrink whitespace-nowrap overflow-hidden max-w-[75%] overflow-ellipsis pr-2
    text-base select-none"
    slot="label"
  >{label}</span>

  <Toggle
    let:id={id} {id}
    let:disabled={disabled}
    {disabled}
    bind:value={value}
    class="ml-auto mr-0 mt-1" slot="control"
  />

  <span
    class="order-6 mt-1 -bottom-6 left-0 w-full flex-shrink-0 text-xs text-gray-500
    whitespace-nowrap overflow-hidden text-ellipsis select-none"
    slot="messages"
    let:error
    let:hint
    let:attributes
    let:errorAttributes
    let:hintAttributes
    {...attributes}
  >
    {#if error}
      <span {...errorAttributes}>{error}</span>
    {/if}

    {#if hint}
      <span {...hintAttributes}>{hint}</span>
    {/if}
  </span>
</Field>
