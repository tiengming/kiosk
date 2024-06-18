<script lang="ts" context="module">
  export type ReactionEvent = CustomEvent<{
    commentId: string;
    emoji: string;
  }>;
</script>

<script lang="ts">
  import Gravatar from 'svelte-gravatar';
  import dayjs from 'dayjs';
  import relativeTime from 'dayjs/plugin/relativeTime';
  import ReactionButton from '$lib/components/Comments/ReactionButton.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import EmojiPicker, { type EmojiPickerInputEvent } from '$lib/components/EmojiPicker/EmojiPicker.svelte';
  import { page } from '$app/stores';
  import { createEventDispatcher } from 'svelte';
  import type { CommentWithUserAndReactions } from '$lib/server/data/comment';

  dayjs.extend(relativeTime);

  export let comment: CommentWithUserAndReactions;
  let activeUserId = $page.data.user.id;
  $: createdAt = new Date(comment.created_at);

  // Find the reaction of the active user
  let reaction: string | undefined = comment.reactions.find(({ user_id }) => (
    user_id.toString() === activeUserId
  ))?.emoji;

  // Transform the reactions from a list to a dictionary, counting the numbers for each emoji
  $: reactions = comment.reactions.reduce<Record<string, {
    emoji: string;
    count: number;
    created_at: Date
  }>>((reactions, { emoji, created_at }) => {
    if (!(emoji in reactions)) {
      reactions[emoji] = {
        emoji,
        count: 0,
        created_at
      };
    }

    reactions[emoji].count++;

    return reactions;
  }, {});

  const dispatch = createEventDispatcher<{
    addReaction: ReactionEvent['detail'];
    removeReaction: ReactionEvent['detail'];
  }>();

  async function addReaction({ detail: { emoji } }: EmojiPickerInputEvent) {
    const commentId = comment.id;

    dispatch('addReaction', { commentId, emoji });
  }

  function toggleReaction(emoji: string) {
    return async () => {
      reaction = reaction === emoji ? undefined : emoji;
      const commentId = comment.id;

      dispatch(reaction ? 'addReaction' : 'removeReaction', { commentId, emoji });
    };
  }
</script>

<article class="grid gap-x-2 grid-cols-[2rem_auto] grid-rows-[auto_min-content_auto] group">
  <aside class="row-span-3" aria-hidden="true">
    <Gravatar
      email={comment.created_by?.email}
      class="rounded-full bg-gray-50 overflow-hidden w-8 h-8"
    />
  </aside>

  <header class="col-start-2 flex items-baseline">
    <h3 class="font-medium font-serif leading-none">
      {comment.created_by?.name}
    </h3>

    <time datetime={createdAt.toISOString()} class="text-xs text-gray-500 ml-2">
      {dayjs(createdAt).fromNow()}
    </time>
  </header>

  <p class="leading-relaxed text-gray-600 dark:text-gray-400 col-start-2">
    {comment.content}
  </p>

  <footer class="col-start-2 mt-0.5">
    <ul class="flex items-center space-x-1">
      {#each Object.entries(reactions) as [emoji, { count }]}
        <li>
          <ReactionButton {emoji} {count} active={emoji === reaction} on:click={toggleReaction(emoji)} />
        </li>
      {/each}

      <li>
        <EmojiPicker let:activate={activate} on:input={addReaction}>
          <button
            on:click={activate}
            class="flex items-center rounded-full cursor-pointer bg-gray-200 dark:bg-gray-800
            dark:hover:bg-blue-950 transition hover:ring focus-visible:ring active:ring-blue-700
            outline-none px-1 py-0.5 opacity-0 group-hover:opacity-100
            group-focus-within/picker:ring group-focus-within/picker:opacity-100"
            aria-label="Add reaction"
            title="Add reaction"
          >
            <Icon name="add" class="text-lg leading-none" />
          </button>
        </EmojiPicker>
      </li>
    </ul>
  </footer>
</article>

