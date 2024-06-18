<script lang="ts">
  import PaginationButton from '$lib/components/Pagination/PaginationButton.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{
    page: number;
    first;
    previous;
    next;
    last;
  }>();

  let className = '';
  // noinspection ReservedWordAsName
  export { className as class };

  /**
   * The total number of pages.
   */
  export let total: number | `${number}`;

  /**
   * The current page number.
   */
  export let current: number | `${number}` = 1;
  $: pages = Array.from({ length: +total }, (_, i) => i + 1);


  /**
   * The maximum number of pages to show in the pagination.
   */
  export let max: number | `${number}` = 5;

  /**
   * Whether to show the first and last buttons.
   *
   * Pass `'auto'` to show them only if there are more pages than the `max` prop.
   */
  export let firstLast: boolean | 'auto' = 'auto';
  $: showFirstLast = firstLast === 'auto' ? +total > +max : firstLast;

  /**
   * Whether to show the previous and next buttons.
   */
  export let prevNext: boolean = true;
  $: showPrevNext = prevNext && +total > 1;

  function isCurrent(page: number) {
    return page === current;
  }

  function first() {
    return () => dispatch('first');
  }

  function last() {
    return () => dispatch('last');
  }

  function previous() {
    return () => dispatch('previous');
  }

  function next() {
    return () => dispatch('next');
  }

  function toPage(page: number) {
    return () => dispatch('page', page);
  }
</script>

{#if +total > 1}
  <nav aria-label="Pagination" class="flex {className}" {...$$restProps}>
    <ul class="flex mx-auto bg-gray-100 dark:bg-gray-900 shadow-inner-sm dark:shadow-inner rounded-full p-2">
      {#if showFirstLast}
        <li class="contents group/pagination">
          <PaginationButton label="First Page" disabled={current === 1} on:click={first}>
            <slot name="first:label">
              <Icon name="keyboard_double_arrow_left" class="mr-0.5 text-lg leading-none" />
            </slot>
          </PaginationButton>
        </li>
      {/if}

      {#if showPrevNext}
        <li class="contents group/pagination">
          <PaginationButton label="Previous Page" disabled={current === 1} on:click={previous}>
            <slot name="prev:label">
              <Icon name="keyboard_arrow_left" class="mr-px text-lg leading-none" />
            </slot>
          </PaginationButton>
        </li>
      {/if}

      {#each pages as page}
        <li class="contents group/pagination">
          <PaginationButton
            label="Page {page}{isCurrent(page) ? ' (current)' : ''}"
            active={isCurrent(page)}
            disabled={isCurrent(page)}
            on:click={toPage(page)}
          >
            <span>{page}</span>
          </PaginationButton>
        </li>
      {/each}

      {#if showPrevNext}
        <li class="contents group/pagination">
          <PaginationButton label="Next Page" disabled={current === total} on:click={next}>
            <slot name="next:label">
              <Icon name="keyboard_arrow_right" class="ml-px text-lg leading-none" />
            </slot>
          </PaginationButton>
        </li>
      {/if}

      {#if showFirstLast}
        <li class="contents group/pagination">
          <PaginationButton label="Last Page" disabled={current === total} on:click={last}>
            <slot name="last:label">
              <Icon name="keyboard_double_arrow_right" class="ml-0.5 text-lg leading-none" />
            </slot>
          </PaginationButton>
        </li>
      {/if}
    </ul>
  </nav>
{/if}
