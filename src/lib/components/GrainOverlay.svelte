<script lang="ts">
  let className: string;
  // noinspection ReservedWordAsName
  export { className as class };
</script>

<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" class={className} {...$$restProps}>
  <filter id="noise" x="0" y="0">
    <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
    <feBlend mode="screen" in2="" />
  </filter>

  <rect width="100%" height="100%" filter="url(#noise)" />
</svg>
