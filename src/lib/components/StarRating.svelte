<script lang="ts" context="module">
  export type ChangeEvent = CustomEvent<{ value: number }>;
</script>

<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';
  import { createEventDispatcher } from 'svelte';
  import { savable } from '$lib/trpc/client';

  const dispatch = createEventDispatcher<{
    change: ChangeEvent['detail'];
  }>();

  let className = '';
  // noinspection ReservedWordAsName
  export { className as class };

  export let value: number;
  $: amount = Math.round(Math.min(Math.max(value, 1), Number(max)));
  export let max: number | `${number}` = 5;
  export let disabled: boolean = false;
  export let starClasses: string = '';
  export let size: 'small' | 'normal' | 'large' = 'normal';

  let projected: number | undefined = undefined;
  let buttonElements: HTMLButtonElement[] = [];

  function update(index: number) {
    return () => {
      value = index + 1;

      dispatch('change', { value });
    };
  }

  function project(index: number | undefined) {
    return () => projected = index;
  }

  function handleKeydown(index: number) {

    return (event: KeyboardEvent) => {
      if (['Left', 'ArrowLeft', 'Down', 'ArrowDown'].includes(event.key)) {
        event.preventDefault();
        projected = Math.max(index - 1, 1);

        if (buttonElements[index - 1]) {
          buttonElements[index - 1].focus();
        }
      } else if (['Right', 'ArrowRight', 'Up', 'ArrowUp'].includes(event.key)) {
        event.preventDefault();
        projected = Math.min(index + 1, Number(max));

        if (buttonElements[index + 1]) {
          buttonElements[index + 1].focus();
        }
      } else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        update(index)();
      }
    };
  }
</script>

<div
  class="flex items-center {className}"
  role="slider"
  aria-valuemin="1"
  aria-valuemax="{Number(max)}"
  aria-valuenow="{value}"
  aria-label="Rate this item from 1 to {max} stars"
>
  <slot name="before" />

  <ul class="contents">
    {#each { length: Number(max) } as _, index}
      {@const filled = typeof projected !== 'undefined' ? index <= projected : index <= amount - 1}

      <li class="contents">
        <button
          class="cursor-pointer flex items-center justify-center outline-none focus-visible:ring
          rounded-full {starClasses}"
          on:mouseover={project(index)}
          on:focus={project(index)}
          on:focusin={project(index)}
          on:mouseleave={project(undefined)}
          on:focusout={project(undefined)}
          on:click={update(index)}
          on:keydown={handleKeydown(index)}
          aria-label="Rate this {index + 1} star"
          tabindex="0"
          {disabled}
          bind:this={buttonElements[index]}
        >
          <slot name="star" {value} {index} {filled}>
            <Icon
              name="star"
              class="leading-none {size === 'small' ? 'text-sm' : size === 'large' ? 'text-3xl' : ''}"
              fill={filled}
            />
          </slot>
        </button>
      </li>
    {/each}
  </ul>


  <slot name="after" />
</div>
