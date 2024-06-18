<script lang="ts">
  import { decode } from 'blurhash';
  import { browser } from '$app/environment';

  let className = '';
  // noinspection ReservedWordAsName, JSUnusedGlobalSymbols
  export { className as class };

  export let blurhash: string;

  export let size: number = 32;

  let canvas: HTMLCanvasElement;

  async function render(blurhash: string, size: number) {

    // Rendering will only work in the browser
    if (!browser) {
      return;
    }

    // Valid blurhash strings must be at least 6 characters in length
    if (blurhash.length <6) {
      return;
    }

    // TODO: Render in web worker, if possible
    const context = canvas?.getContext('2d');
    const pixels = decode(blurhash, size, size);
    const imageData = new ImageData(pixels, size, size);
    context?.putImageData(imageData, 0, 0);
  }

  $: canvas && render(blurhash, size);
</script>

<canvas
  bind:this={canvas}
  width="{size}px"
  height="{size}px"
  class="dark:opacity-70 bg-white dark:bg-black {className}"
/>
