<script lang="ts">
  let className = "";
  // noinspection ReservedWordAsName, JSUnusedGlobalSymbols
  export { className as class };
  const classes = `mb-4 w-full ${ className }`.trimEnd();

  export let title: string;
</script>

<header class="{classes}" {...$$restProps}>
  <slot name="content">
    <h1 class="text-3xl font-medium font-serif">
      <slot>{title}</slot>
    </h1>
  </slot>
</header>
