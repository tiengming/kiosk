<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';
  import type { CommentWithUserAndReactions } from '$lib/server/data/comment';
  import Comment from '$lib/components/Comments/Comment.svelte';
  import CommentForm from '$lib/components/Comments/CommentForm.svelte';
  import { createEventDispatcher } from 'svelte';
  import CommentsSummary from '$lib/components/Comments/CommentsSummary.svelte';
  import ContentSection from '$lib/components/ContentSection.svelte';
  import { clickOutside } from '$lib/utilities';

  export let loading = false;
  export let comments: CommentWithUserAndReactions[];
  // $: browser && internalComments.then(() => tick()).then(() => commentList.lastElementChild?.scrollIntoView({
  //   behavior: 'smooth'
  // }));

  let expanded = false;
  let commentList: HTMLUListElement;

  const dispatch = createEventDispatcher<{
    opened;
    closed;
  }>();

  function toggle() {
    if (expanded) {
      close();
    } else {
      open();
    }
  }

  export function open() {
    expanded = true;
    dispatch('opened');
  }

  function close() {
    expanded = false;
    dispatch('closed');
  }
</script>

<footer
  class="fixed bottom-0 right-0 w-4/5 mt-auto transition ease-in duration-100"
  class:translate-y-[calc(100%_-_3.5rem)]={!expanded}
  class:translate-y-0={expanded}
  use:clickOutside
  on:clickOutside={close}
>
  <ContentSection class="relative h-full">
    <div class="bg-gradient-to-br from-blue-950/75 to-blue-900/75 rounded-3xl backdrop-blur-3xl
         backdrop-saturate-200 shadow-2xl shadow-blue-500/25 dark:shadow-blue-500/10">

      <!-- Panel activator -->
      <button
        class="text-white w-full p-4 rounded-t-[inherit] flex items-center justify-between
        cursor-pointer transition"
        class:pt-3={!expanded}
        on:click={toggle}
      >
        <span class="flex items-center">
          <span class="mr-4">
            <Icon name="forum" class="leading-none text-2xl" />
          </span>

          {#if loading}
            <span>Loading...</span>
          {:else}
            <CommentsSummary {comments} />
          {/if}
        </span>

        <Icon name={expanded ? 'keyboard_double_arrow_down' : 'keyboard_double_arrow_up'} />
      </button>

      <div class="mb-2 bg-gray-100 dark:bg-gray-950 rounded-3xl shadow-lg shadow-blue-900/25
           dark:shadow-blue-700/10 overflow-hidden">
        <div class="max-h-96 overflow-y-auto px-4 pt-4">
          <ul class="divide-y dark:divide-gray-800/75" bind:this={commentList}>
            {#each comments as comment}
              <li class="py-2">
                <Comment {comment} on:addReaction on:removeReaction />
              </li>
            {/each}
          </ul>

          <CommentForm
            on:submit
            disabled={loading}
            class="sticky bottom-0 pb-4 rounded-t-xl bg-gray-100 dark:bg-gray-950"
          />
        </div>
      </div>
    </div>
  </ContentSection>
</footer>
