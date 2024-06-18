<script lang="ts">
  import { twMerge } from 'tailwind-merge';

  let className = '';
  export { className as class };
  export let size: number = 32;
  export let speed: number = 750;
  export let thickness: number = 4;
  export let gap: number = 40;
  export let radius: number = 14;
  export let paused: boolean = false;

  let dash: number;
  $: dash = 2 * Math.PI * radius * (100 - gap) / 100;

  const classList = twMerge(className, 'relative');
</script>

<div
  {...$$restProps}
  class={classList}
  aria-valuetext="Loading..."
  aria-valuemin="0"
  aria-valuemax="100"
  aria-busy="true"
  aria-live="polite"
  role="progressbar"
>
  <svg
    height="{size}"
    width="{size}"
    style:animation-duration="{speed}ms"
    style:animation-play-state={paused ? 'paused' : 'running'}
    class="svelte-spinner transition-transform animate-spin"
    viewBox="0 0 32 32"
  >
    <circle
      role="presentation"
      cx="16"
      cy="16"
      r={radius}
      fill="none"
      stroke-width={thickness}
      stroke-linecap="round"
      class="stroke-gray-100 dark:stroke-gray-700 [animation-play-state:inherit]"
    />
    <circle
      role="presentation"
      cx="16"
      cy="16"
      r={radius}
      fill="none"
      stroke-width={thickness}
      stroke-dasharray="{dash},100"
      stroke-linecap="round"
      class="stroke-blue-500 [animation-iteration-count:infinite] [animation-play-state:inherit]"
      style:animation-duration="{speed * 2}ms"
    />
  </svg>

  <div class="absolute inset-0 flex justify-center items-center">
    <slot />
  </div>
</div>

<style lang="postcss">
    circle[stroke-width] {
        animation-name: squeeze;
    }

    @keyframes squeeze {
        0%, 100% {
            stroke-dashoffset: 0;
        }
        50% {
            stroke-dashoffset: 22;
        }
    }
</style>
