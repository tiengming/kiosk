<script lang="ts">
  import Button from '$lib/components/Form/Button.svelte';
  import Icon from '$lib/components/Icon.svelte';

  export let value: string;
  export let icon: string | undefined = 'content_copy';
  export let completeIcon: string | undefined = 'check';
  export let label: string = 'Copy';
  export let completeLabel: string = 'Copied';
  export let resetCompleteTimeout = 3_000;
  let complete = false;
  $: currentLabel = complete ? completeLabel : label;
  $: currentIcon = complete ? completeIcon : icon;

  async function copyToClipboard() {
    if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(value);
      complete = true;
      setTimeout(() => complete = false, resetCompleteTimeout);
    }

    return Promise.reject('The Clipboard API is not available');
  }
</script>

<Button {...$$restProps} on:click={copyToClipboard} on:keydown>
  <slot>
    {#if currentIcon || $$slots.icon}
      <Icon class="text-xl leading-none pr-1">
        <slot {complete} name="icon">{currentIcon}</slot>
      </Icon>
    {/if}
    <span>
      <slot {complete} name="label">{currentLabel}</slot>
    </span>
  </slot>
</Button>
