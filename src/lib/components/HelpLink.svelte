<script lang="ts">
  import Button from '$lib/components/Form/Button.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import { PUBLIC_HELP_CENTER_BASE_URL } from '$env/static/public';

  const helpCenterUrl = PUBLIC_HELP_CENTER_BASE_URL.endsWith('/')
    ? PUBLIC_HELP_CENTER_BASE_URL
    : `${PUBLIC_HELP_CENTER_BASE_URL}/`;
  export let topic: string;
  export let label = 'Help';
  export let icon = 'help';
  $: slug = topic.startsWith('/') ? topic.substring(1) : topic;
  $: href = new URL(slug, helpCenterUrl).toString();
</script>

<Button {href} {...$$restProps}>
  <slot>
    {#if icon || $$slots.icon}
      <Icon weight="700" class="text-xl leading-none pr-1">
        <slot {topic} name="icon">{icon}</slot>
      </Icon>
    {/if}
    <span>
      <slot {topic} name="label">{label}</slot>
    </span>
  </slot>
</Button>
