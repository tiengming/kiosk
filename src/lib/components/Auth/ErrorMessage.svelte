<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';

  let className = '';
  // noinspection ReservedWordAsName
  export { className as class };

  export let message: string | undefined = undefined;
  export let icon: string = 'sentiment_dissatisfied';
</script>

<div
  class="error max-w-lg mb-8 bg-red-500 text-white rounded py-2 px-4 shadow-md flex items-start {className}"
  {...$$restProps}
>
  <Icon name={icon} class="mr-4 mt-1" />
  <slot><span>{message}</span></slot>
</div>
