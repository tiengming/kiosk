<script lang="ts" context="module">
  interface Input {
    value: string;
  }

  export type InputEvent = CustomEvent<Input>;

  interface Paste {
    value: string;
  }

  export type PasteEvent = CustomEvent<Paste>;

  type Backspace = {
    focusPrevious: boolean;
  };

  export type BackspaceEvent = CustomEvent<Backspace>;

  type Clear = void;

  export type ClearEvent = CustomEvent<Clear>;
</script>

<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  // region Props
  export let name: string;
  export let id: string | undefined = undefined;
  export let value: string = '';
  export let placeholder: string = '·';
  export let disabled: boolean = false;
  export let numeric: boolean = false;
  export let autofocus: boolean = false;
  // endregion

  const dispatch = createEventDispatcher<{
    backspace: Backspace;
    input: Input;
    paste: Paste;
    clear: Clear;
  }>();

  let digit: HTMLInputElement;

  function handlePaste(event: Event) {
    // Get pasted data via clipboard API
    let clipboardData = (event as ClipboardEvent).clipboardData;
    let value = clipboardData
      ?.getData('Text')
      ?.toUpperCase()
      ?.replace(numeric ? /[^0-9]/g : /[^0-9A-Z]/g, '');

    if (!value) {
      return;
    }

    updateValue(value.slice(0, 1));
    dispatch('paste', { value });
  }

  function handleKey(event: KeyboardEvent) {

    // Clear all digits on CMD + Backspace
    if (event.metaKey && event.key === 'Backspace') {
      event.preventDefault();
      dispatch('clear');
      value = '';

      return;
    }

    // Do not interrupt keyboard combinations
    if (event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }

    // Delete the digit on backspace. If the digit is empty, focus the previous digit
    if (event.key === 'Backspace') {
      event.preventDefault();
      dispatch('backspace', { focusPrevious: value === '' });
      value = '';

      return;
    }

    if (['Enter', 'Tab'].includes(event.key)) {
      return;
    }

    updateValue(event.key);
    event.preventDefault();
  }

  function updateValue(newValue: string) {
    if (!newValue.match(numeric ? /^[0-9]$/ : /^[0-9a-zA-Z]$/)) {
      return;
    }

    value = newValue.toUpperCase();
    dispatch('input', { value });
  }

  export function focus(selectDigit = false) {
    digit.focus();

    if (selectDigit) {
      select();
    }
  }

  export function select() {
    digit.select();
  }
</script>

<label class="digit" for={name}>
  <!-- svelte-ignore a11y-autofocus -->
  <input
    id={id ?? name}
    {name}
    inputmode={numeric ? 'numeric' : 'text'}
    type="text"
    {placeholder}
    {disabled}
    {autofocus}
    value={value}
    on:paste|preventDefault={handlePaste}
    on:keydown={handleKey}
    maxlength={1}
    class="text-center w-10 h-12 px-0 py-2 border-gray-200 shadow-sm rounded disabled:bg-gray-100
     bg-white dark:bg-black transition font-mono focus:placeholder-transparent"
    bind:this={digit}
  />
</label>

