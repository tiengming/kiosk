<script lang="ts">
  import { twMerge } from 'tailwind-merge';

  let className = '';
  // noinspection ReservedWordAsName
  export { className as class };
  export let size: 'small' | 'medium' | 'large' = 'medium';
  export let speed: 'slow' | 'normal' | 'fast' = 'normal';
  $: duration = {
    'slow': '2s',
    'normal': '1s',
    'fast': '0.5s'
  }[speed];

  const classList = twMerge({
      'small': 'w-12 h-8 after:shadow-[0_1px_0_0.5px_rgba(0,0,0,0.2)]',
      'medium': 'w-24 h-16 after:shadow-[0_2px_0_1px_rgba(0,0,0,0.2)]',
      'large': 'w-32 h-24 after:shadow-[0_2px_0_1px_rgba(0,0,0,0.2)]'
    }[size]);
</script>

<div class="px-1 {className}">
  <div
    class="relative flex after:content-[''] after:absolute after:top-[5%] after:bottom-[10%]
    after:left-0 after:right-0 after:bg-gray-200 after:-z-10 [transform:perspective(var(--perspective))_rotateX(var(--rotation))]
    [transform-style:preserve-3d] {classList}"
    style:--perspective={size === 'small' ? '100px' : '300px'}
    style:--rotation={size === 'small' ? '40deg' : '30deg'}
    style:--speed={duration}
  >
    <div
      class="absolute top-0 w-1/2 h-full -mt-[10%] [clip-path:url(#book-curvature)] bg-gradient-to-r
      from-gray-100 via-30% via-gray-50 to-gray-100 left-0
      shadow-[0_1px_0_1px_rgba(0,0,0,0.005),0_3px_0_1px_rgba(0,0,0,0.01)]"
    />
    <div
      class="absolute top-0 w-1/2 h-full -mt-[10%] [clip-path:url(#book-curvature)] bg-gradient-to-r
      from-gray-100 via-30% via-gray-50 to-gray-100 left-1/2
      shadow-[inset_1px_0_0_-0.5px_rgba(0,0,0,0.1)]"
    />
    <div
      data-flipping-page
      class="absolute top-0 w-1/2 h-full -mt-[10%] [clip-path:url(#book-curvature)] bg-gradient-to-r
      from-gray-200 via-30% via-gray-100 to-gray-200 left-0 origin-right"
    />
  </div>

  <svg width="0" height="0">
    <defs>
      <clipPath id="book-curvature" clipPathUnits="objectBoundingBox">
        <path d="M 0 0.2 C 0.35 0 0.65 0 1 0.2 L 1 1 C 0.65 0.8 0.35 0.8 0 1 L 0 0.2 Z" />
      </clipPath>
    </defs>
  </svg>
</div>

<style lang="postcss">
    [data-flipping-page] {
        animation: page-flip var(--speed) infinite forwards;
    }

    @keyframes page-flip {
        0% {
            opacity: 0;
        }
        5% {
            transform: rotateY(180deg) translateX(0);
        }
        50% {
            opacity: 1;
        }
        90% {
            transform: rotateY(0) translateX(0);
        }
        99% {
            opacity: 0;
            transform: rotateY(0) translateX(0);
        }
        100% {
            opacity: 0;
            transform: rotateY(0) translateX(100%);
        }
    }
</style>
