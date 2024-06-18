<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';
  import type { MaybePromise } from '$lib/utilities';
  import type { Review } from './+page@(library).svelte';
  import Modal from '$lib/components/Modal.svelte';
  import MarkdownContent from '$lib/components/MarkdownContent.svelte';
  import ContentSection from '$lib/components/ContentSection.svelte';
  import dayjs from 'dayjs';
  import relativeTime from 'dayjs/plugin/relativeTime';

  dayjs.extend(relativeTime);

  export let reviews: MaybePromise<Review[]>;
  $: internalReviews = Promise.resolve(reviews);

  let reviewModalOpen = false;
  let activeReview: Review | undefined = undefined;

  function showReview(review: Review) {
    return () => {
      activeReview = review;
      reviewModalOpen = true;
    };
  }

  function handleModalClosed() {
    activeReview = undefined;
  }
</script>

<section class="px-4 pt-4 pb-6 shadow-inner-sm bg-gray-50 dark:bg-gray-900 rounded-3xl">
  <header class="mb-2 px-3">
    <h3 class="text-xl font-bold font-serif dark:text-gray-200">Reviews</h3>
  </header>

  {#await internalReviews}
    <span>TODO: Loading Indicator...</span>
  {:then reviews}
    {#if reviews.length > 0}
      <ul class="flex flex-col space-y-2">
        {#each reviews as review}
          <li class="flex items-center space-x-2">
            <button
              on:click={showReview(review)}
              type="button"
              tabindex="0"
              class="flex flex-col hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:bg-gray-100
              dark:focus-visible:bg-gray-800 focus-visible:ring transition rounded-xl py-1 px-3 outline-none group"
              aria-labelledby="review-label-{review.id}"
            >
              <!-- region Reviewer and publication -->
              <strong class="inline-flex items-center font-semibold dark:text-gray-300">
                {#if review.reviewer}
                  <span>{review.reviewer.name}</span>
                {/if}
                {#if review.reviewer && review.publication_name}
                  <span class="text-gray-500 dark:text-gray-400">&hairsp;—&hairsp;</span>
                {/if}
                {#if review.publication_name}
                  <span>{review.publication_name}</span>
                {/if}
              </strong>
              <!-- endregion -->

              <!-- region Review excerpt -->
              <span class="block leading-normal text-left text-gray-700 dark:text-gray-300">
                {review.excerpt}
              </span>
              <!-- endregion -->

              <!-- region "Read full" button -->
              <span
                class="mt-1 ml-auto flex items-center text-sm transition text-gray-500 dark:text-gray-400
                group-hover:text-gray-900 dark:group-hover:text-gray-200 group-focus-visible:text-gray-900
                dark:group-focus-visible:text-gray-200"
              >
                <span class="mr-1" id="review-label-{review.id}">Read full review</span>
                <Icon
                  name="arrow_right_alt"
                  class="text-lg group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5
                  transition-transform"
                />
              </span>
              <!-- endregion -->
            </button>
          </li>
        {/each}
      </ul>

      <Modal bind:open={reviewModalOpen} on:close={handleModalClosed}>
        <h2 class="font-bold dark:text-gray-200" slot="header">Review</h2>

        <ContentSection narrow>
          {#if activeReview}
            <MarkdownContent source={activeReview.content} />

            <footer class="flex items-center justify-between mt-8 mb-4 text-gray-500 text-sm">
              {#if activeReview.url}
                <span>
                  Originally published at:
                  <a
                    href={activeReview.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-blue-500 dark:text-blue-400 hover:underline"
                  >
                    {new URL(activeReview.url).hostname}
                  </a>
                </span>
              {/if}

              <span>Last updated: {dayjs(activeReview.created_at).fromNow()}</span>
            </footer>
          {/if}
        </ContentSection>
      </Modal>
    {:else}
      <div class="px-3 py-6">
        <p class="text-gray-500 dark:text-gray-600">
          There are no reviews available for this book yet.
        </p>
      </div>
    {/if}
  {/await}
</section>
