<script lang="ts" context="module">
  export type ChangeEvent = CustomEvent<{
    page: number;
  }>;
</script>

<script lang="ts" generics="T extends unknown">
  import LoadingSpinner from '$lib/LoadingSpinner.svelte';
  import Pagination from '$lib/components/Pagination/Pagination.svelte';
  import type { MaybePromise } from '$lib/utilities';
  import type { PaginationData } from '$lib/trpc/client';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { fade } from 'svelte/transition';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{
    change: ChangeEvent['detail'];
  }>();

  export let data: MaybePromise<[T[], PaginationData]>;
  export let transitionDuration = 100;
  export let transitionAppearDelay = transitionDuration * 0.1;
  $: transition = { duration: transitionDuration };

  /**
   * The maximum number of pages to show in the pagination.
   *
   * @see Pagination
   */
  export let max: number | `${number}` = 5;

  /**
   * Whether to show the first and last buttons.
   *
   * Pass `'auto'` to show them only if there are more pages than the `max` prop.
   *
   * @see Pagination
   */
  export let firstLast: boolean | 'auto' = 'auto';

  /**
   * Whether to show the previous and next buttons.
   *
   * @see Pagination
   */
  export let prevNext: boolean = true;

  /**
   * Whether to automatically update the page query parameter.
   *
   * Pass `false` to disable this; note that you will need to handle page changes manually.
   */
  export let queryParam: false | string = 'page';

  function updatePage(to?: number) {
    return ({ detail }: CustomEvent<number | void>) => {
      const target = detail ?? to ?? 1;
      dispatch('change', { page: target });

      if (!queryParam) {
        return;
      }

      const url = new URL($page.url);

      if (target === 1) {
        url.searchParams.delete(queryParam);
      } else {
        url.searchParams.set(queryParam, target.toString());
      }

      goto(url);
    };
  }
</script>

<div class="grid">
  {#await Promise.resolve(data)}
    <div
      class="col-span-full row-span-full flex justify-center py-16"
      in:fade={transition}
      out:fade={transition}
    >
      <slot name="loading">
        <LoadingSpinner />
      </slot>
    </div>
  {:then [items, pagination]}
    <div
      class="col-span-full row-span-full"
      in:fade={{delay: transitionAppearDelay, ...transition}}
      out:fade={transition}
    >
      <slot {items} {pagination} />

      <!--{JSON.stringify(pagination)}-->
      <slot name="pagination" {items} {pagination} {updatePage} {max} {firstLast} {prevNext}>
        <Pagination
          class="mt-8"
          {max}
          {firstLast}
          {prevNext}
          total={Number(pagination.last_page)}
          current={Number(pagination.page)}
          on:page={updatePage()}
          on:first={updatePage(1)}
          on:last={updatePage(Number(pagination.last_page))}
          on:previous={updatePage(Number(pagination.page) - 1)}
          on:next={updatePage(Number(pagination.page) + 1)}
        />
      </slot>
    </div>
  {/await}
</div>
