<script lang="ts">
  let className = '';
  // noinspection ReservedWordAsName, JSUnusedGlobalSymbols
  export { className as class };
  const classes = `resize-none ${className}`;

  export let id: string = '';
  export let name: string;
  export let value: string = '';
  export let disabled: boolean=false;

  let textarea = null;
  let height = 120;

  type ResizeEvent = CustomEvent<{
    rect: DOMRectReadOnly;
    target: HTMLTextAreaElement
  }>;

  function onResize(event: ResizeEvent) {
    textarea = event.target;
    height = event.detail.rect.height;
  }

  export function resize(node: Element) {
    let rect: DOMRectReadOnly;
    let target: Element;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        rect = entry.contentRect;
        target = entry.target;
      }

      node.dispatchEvent(new CustomEvent('resize', {
        detail: { rect, target }
      }) as ResizeEvent);
    });

    resizeObserver.observe(node);

    return {
      destroy: () => resizeObserver.disconnect()
    };
  }

  $: rows = (value && value.match(/\n/g) || []).length + 1 || 1;
</script>

<textarea
  use:resize
  {disabled}
  rows={rows}
  bind:this={textarea}
  on:resize={onResize}
  style="--height:auto"
  class={classes}
  name={name}
  id={id}
  bind:value
  {...$$restProps}
  on:keyup
  on:keydown
  on:keypress
  on:input
  on:change
  on:blur
  on:focus
  on:submit
/>

<style>
    textarea {
        height: var(--height);
    }
</style>
