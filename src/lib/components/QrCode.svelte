<script lang="ts">
  import Qrcode, { type QRCode, type QRCodeErrorCorrectionLevel } from 'qrcode';
  import { twMerge } from 'tailwind-merge';
  import { fade, type TransitionConfig } from 'svelte/transition';

  let className = '';
  // noinspection ReservedWordAsName
  export { className as class };
  $: classList = twMerge('bg-white dark:bg-black', className);

  export let value: string;
  export let errorCorrectionLevel: QRCodeErrorCorrectionLevel = 'Q';
  export let maskXToYRatio: number = 1;
  export let squares: boolean = false;
  export let margin: number = 0;
  export let maskCenter: boolean = false;
  export let transition: TransitionConfig = { duration: 100 };
  let qr: QRCode | undefined;
  $: qr = value
    ? Qrcode.create(value, { errorCorrectionLevel, maskPattern: 0 })
    : undefined;
  $: count = qr?.modules?.size ?? 0;
  $: pixelSize = count + margin * 2;
  $: coordinateShift = pixelSize / 2;

  function isPositioningElement(row: number, column: number, count: number) {
    const elemWidth = 7;

    return row <= elemWidth
      ? column <= elemWidth || column >= count - elemWidth
      : column <= elemWidth
        ? row >= count - elemWidth
        : false;
  }

  /**
   * For ErrorCorrectionLevel 'H', up to 30% of the code can be corrected. To
   * be safe, we limit damage to 10%.
   */
  function isRemovableCenter(
    row: number,
    column: number,
    count: number,
    maskCenter: boolean,
    maskXToYRatio: number
  ) {
    if (!maskCenter) {
      return false;
    }

    const center = count / 2;
    const safelyRemovableHalf = Math.floor((count * Math.sqrt(0.1)) / 2);
    const safelyRemovableHalfX = safelyRemovableHalf * maskXToYRatio;
    const safelyRemovableHalfY = safelyRemovableHalf / maskXToYRatio;
    const safelyRemovableStartX = center - safelyRemovableHalfX;
    const safelyRemovableEndX = center + safelyRemovableHalfX;
    const safelyRemovableStartY = center - safelyRemovableHalfY;
    const safelyRemovableEndY = center + safelyRemovableHalfY;

    return (
      row >= safelyRemovableStartY &&
      row <= safelyRemovableEndY &&
      column >= safelyRemovableStartX &&
      column <= safelyRemovableEndX
    );
  }

  function showModule(column: number, row: number) {
    return (
      qr!.modules.get(column, row) &&
      (squares || (
        !isPositioningElement(row, column, count) &&
        !isRemovableCenter(row, column, count, maskCenter, maskXToYRatio)
      ))
    );
  }
</script>

<div
  class="relative col-span-full row-span-full flex items-center justify-center {classList}"
  in:fade={transition}
  out:fade={transition}
  {...$$restProps}
>
  <div class="absolute flex items-center justify-center" class:hidden={squares} class:invisible={squares}>
    <div style:width={`${(28 * maskXToYRatio)}%`} style:margin="5px 0 0 5px">
      <slot />
    </div>
  </div>

  {#if qr}
    {#key qr}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        viewBox="{(margin - 0.5) - coordinateShift} {(margin - 0.5) - coordinateShift} {pixelSize} {pixelSize}"
        preserveAspectRatio="xMinYMin meet"
      >

        <!-- region squares -->
        {#if !squares}
          <!-- region top left -->
          <path
            class="position-ring fill-current"
            d="M{margin - coordinateShift} { margin - 0.5 - coordinateShift}h6s.5 0 .5 .5v6s0 .5-.5
             .5h-6s-.5 0-.5-.5v-6s0-.5 .5-.5zm.75 1s-.25 0-.25 .25v4.5s0 .25 .25 .25h4.5s.25 0
             .25-.25v-4.5s0-.25 -.25 -.25h-4.5z"
          />
          <path
            class="position-center fill-current"
            d="M{margin + 2 - coordinateShift} {margin + 1.5 - coordinateShift}h2s.5 0 .5 .5v2s0
            .5-.5 .5h-2s-.5 0-.5-.5v-2s0-.5 .5-.5z"
          />
          <!-- endregion -->

          <!-- region top right -->
          <path
            class="position-ring fill-current"
            d="M{(count - 7 + margin) - coordinateShift} {margin - 0.5 - coordinateShift}h6s.5 0 .5
            .5v6s0 .5-.5 .5h-6s-.5 0-.5-.5v-6s0-.5 .5-.5zm.75 1s-.25 0-.25 .25v4.5s0 .25 .25
            .25h4.5s.25 0 .25-.25v-4.5s0-.25 -.25 -.25h-4.5z"
          />
          <path
            class="position-center fill-current"
            d="M{(count - 7 + margin) + 2 - coordinateShift} {margin + 1.5 - coordinateShift}h2s.5
            0 .5 .5v2s0 .5-.5 .5h-2s-.5 0-.5-.5v-2s0-.5 .5-.5z"
          />
          <!-- endregion -->

          <!-- region bottom left -->
          <path
            class="position-ring fill-current"
            d="M{margin - coordinateShift} {(count - 7 + margin) - 0.5 - coordinateShift}h6s.5
            0 .5 .5v6s0 .5-.5 .5h-6s-.5 0-.5-.5v-6s0-.5 .5-.5zm.75 1s-.25 0-.25 .25v4.5s0 .25 .25
            .25h4.5s.25 0 .25-.25v-4.5s0-.25 -.25 -.25h-4.5z"
          />
          <path
            class="position-center fill-current"
            d="M{margin + 2 - coordinateShift} {(count - 7 + margin) + 1.5 - coordinateShift}h2s.5
            0 .5 .5v2s0 .5-.5 .5h-2s-.5 0-.5-.5v-2s0-.5 .5-.5z"
          />
          <!-- endregion -->
        {/if}
        <!-- endregion -->

        <!-- region modules -->
        {#each { length: count } as _, column}
          {@const positionX = column + margin}

          {#each { length: count } as _, row}
            {#if showModule(column, row)}
              {@const positionY = row + margin}
              {#if squares}
                <rect
                  x={positionX - 0.5 - coordinateShift}
                  y={positionY - 0.5 - coordinateShift}
                  class="fill-current"
                  width="1"
                  height="1"
                />
              {:else}
                <circle
                  class="fill-current"
                  cx={positionX - coordinateShift}
                  cy={positionY - coordinateShift}
                  r="0.5"
                />
              {/if}
            {/if}
          {/each}
        {/each}
        <!-- endregion -->
      </svg>
    {/key}
  {/if}
</div>
