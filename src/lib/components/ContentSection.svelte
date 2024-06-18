<script lang="ts">
  let className = '';
  // noinspection ReservedWordAsName
  export { className as class };
  export let padding = false;
  export let narrow = false;
</script>

<div
  class="px-20 w-full mx-auto {className}"
  class:py-20={padding}
  class:max-w-3xl={narrow}
  class:max-w-7xl={!narrow}
  {...$$restProps}
>
  <slot />
</div>
