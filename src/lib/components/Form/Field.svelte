<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';
  import { generateRandomString } from '$lib/utilities';
  import { createEventDispatcher } from 'svelte';
  import type { HTMLInputAttributes } from 'svelte/elements';
  import { twMerge } from 'tailwind-merge';

  let className: string = '';
  // noinspection ReservedWordAsName
  export { className as class };

  export let value: string | undefined = '';
  export let label: string | undefined = undefined;
  export let hint: string | undefined = undefined;
  export let error: string | undefined = undefined;
  export let prependIcon: string | undefined = undefined;
  export let appendIcon: string | undefined = undefined;

  // region Input Props
  export let type: HTMLInputAttributes['type'] = 'text';
  export let name: HTMLInputAttributes['name'] | undefined = undefined;
  export let placeholder: HTMLInputAttributes['placeholder'] | undefined = undefined;
  export let autocomplete: HTMLInputAttributes['autocomplete'] | undefined = undefined;
  export let disabled: HTMLInputAttributes['disabled'] = false;
  export let readonly: HTMLInputAttributes['readonly'] = false;
  export let required: HTMLInputAttributes['required'] = false;
  export let autofocus: HTMLInputAttributes['autofocus'] = false;
  export let step: HTMLInputAttributes['step'] | undefined = undefined;
  export let max: HTMLInputAttributes['max'] | undefined = undefined;
  export let maxlength: HTMLInputAttributes['maxlength'] | undefined = undefined;
  export let min: HTMLInputAttributes['min'] | undefined = undefined;
  export let minlength: HTMLInputAttributes['minlength'] | undefined = undefined;
  export let size: HTMLInputAttributes['size'] | undefined = undefined;
  export let pattern: HTMLInputAttributes['pattern'] | undefined = undefined;
  export let inputmode: HTMLInputAttributes['inputmode'] | undefined = undefined;
  // endregion

  const dispatch = createEventDispatcher<{
    submit: void;
  }>();
  let id = 'field-' + generateRandomString(6);

  function handleKeypress({ key }: KeyboardEvent) {
    if (key === 'Enter') {
      dispatch('submit');
    }
  }

  const classList = twMerge(
    'relative flex items-center flex-wrap ring-1 ring-gray-200 dark:ring-gray-700 rounded-md ' +
    'mb-2 bg-white dark:bg-black transition shadow focus:outline-none focus-within:ring-2 ' +
    'focus-within:ring-blue-500 focus-within:shadow-blue-500/10 focus-within:shadow-lg ' +
    'dark:focus-within:ring-blue-700 dark:text-gray-300 selection:bg-blue-500 ' +
    'selection:text-white dark:selection:text-gray-300 aria-disabled:bg-gray-50 ' +
    'aria-disabled:shadow-none has-[[readonly]]:bg-gray-100 has-[[readonly]]:dark:bg-gray-800 ' +
    'has-[[readonly]]:pointer-events-none has-[[data-form-field="messages"]]:mb-7 group',
    error ? 'ring-red-500 dark:ring-red-400' : '',
    className
  );
</script>

<label
  for={id}
  class={classList}
  class:pointer-events-none={readonly}
  aria-disabled={disabled || readonly}
  data-form-field
>
  <slot name="prepend" />

  {#if $$slots.prependIcon || prependIcon}
    <span
      class="leading-none h-6 text-gray-500 select-none group-focus-within:text-blue-500 transition
      order-2 pl-2 hidden md:inline"
      data-form-field="prepend-icon"
    >
      <slot name="prependIcon">
        <Icon name={prependIcon} />
      </slot>
    </span>
  {/if}

  <!-- svelte-ignore a11y-autofocus -->
  <span class="order-3 flex flex-auto peer/control" data-form-field="control">
    <slot
      name="control"
      fieldName={name}
      {type} {id} {placeholder} {disabled} {autocomplete} {readonly} {max} {min} {autofocus} {size}
      {required} {inputmode} {maxlength} {minlength} {pattern} {step} {value}
    >

      <!-- svelte-ignore a11y-autofocus -->
      <!-- See https://stackoverflow.com/questions/57392773/75298645#75298645 -->
      <input
        {...{ type }} {id} {name} {placeholder} {disabled} {autocomplete} {readonly} {max} {min}
        {autofocus} {size} {required} {inputmode} {maxlength} {minlength} {pattern} {step}
        bind:value
        class="grow border-none bg-transparent rounded-md ring-0 px-2 pt-1 pb-1 min-w-0 outline-none
        focus-visible:ring-0"
        tabindex={disabled || readonly ? -1 : 0}
        on:keypress={handleKeypress}
        on:paste
        on:keyup
        on:keydown
        on:submit
      >
    </slot>
  </span>

  {#if $$slots.label || label}
    <slot name="label">
      <span
        class="order-1 w-full flex items-center justify-between flex-shrink-0 px-2 text-sm
        text-gray-500 select-none group-focus-within:text-blue-500 transition
        peer-data-[form-field=control]/control:mt-1"
        data-form-field="label"
      >
        <slot name="labelText">
          <span class="inline-flex items-baseline">
            {label}
            {#if required}
              <span class="ml-px text-red-500 group-focus-within:text-blue-500">*</span>
            {/if}
          </span>
        </slot>
        <slot name="appendLabel" />
      </span>
    </slot>
  {/if}

  {#if $$slots.appendIcon || appendIcon}
    <span
      class="leading-none h-6 text-gray-500 select-none transition hidden md:inline order-4 px-2
      group-focus-within:text-blue-500"
      data-form-field="append-icon"
    >
      <slot name="appendIcon">
        <Icon name={appendIcon} />
      </slot>
    </span>
  {/if}

  <slot {value} />

  {#if $$slots.postfix}
    <div class="order-5 p-1" data-form-field="postfix">
      <slot name="postfix" />
    </div>
  {/if}

  {#if $$slots.messages || $$slots.hint || hint || $$slots.error || error}
    <slot
      name="messages"
      attributes={{dataFormField: 'messages'}}
      errorAttributes={{dataFormFieldMessage: 'error'}}
      hintAttributes={{dataFormFieldMessage: 'hint'}}
      {error}
      {hint}
    >
      <span
        class="absolute -bottom-6 left-0 w-full flex-shrink-0 px-2 text-xs text-gray-500
        whitespace-nowrap overflow-hidden text-ellipsis select-none"
        data-form-field="messages"
      >
        {#if $$slots.error || error}
          <slot name="error">
            <span data-form-field-message="error" class="text-red-700">{error}</span>
          </slot>
        {:else if $$slots.hint || hint}
          <slot name="hint">
            <span data-form-field-message="hint">{hint}</span>
          </slot>
        {/if}
      </span>
    </slot>
  {/if}
</label>
