<script lang="ts">
  import Avatar from '$lib/components/Avatar.svelte';
  import StarRating from '$lib/components/StarRating.svelte';
  import type { MaybePromise } from '$lib/utilities';
  import type { Rating } from './+page@(library).svelte';

  export let ratings: MaybePromise<Rating[]>;
</script>

<section class="px-4 pt-4 pb-6 shadow-inner-sm bg-gray-50 dark:bg-gray-900 rounded-3xl">
  <header class="mb-2 px-3">
    <h3 class="text-xl font-bold font-serif dark:text-gray-200">Ratings</h3>
  </header>

  {#await Promise.resolve(ratings)}
    <span>TODO: Loading Indicator...</span>
  {:then ratings}
    {#if ratings.length}
      <ul class="flex flex-col space-y-2">
        {#each ratings as rating}
          <li class="flex items-center space-x-2">
            <Avatar user={{email: rating.user_email}} size={16} />
            <StarRating starClasses="text-lg" disabled size="small" value={rating.rating} />
          </li>
        {/each}
      </ul>
    {:else}
      <div class="px-3 py-6">
        <p class="text-gray-500 dark:text-gray-600">
          There are no ratings available for this book yet.
        </p>
      </div>
    {/if}
  {/await}
</section>
