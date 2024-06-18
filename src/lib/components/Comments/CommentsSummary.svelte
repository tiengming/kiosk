<script lang="ts">
  import type { CommentWithUser } from '$lib/server/data/comment';
  import AvatarGroup from '$lib/components/AvatarGroup.svelte';
  import { uniqueBy } from '$lib/utilities';

  let className = '';
  // noinspection ReservedWordAsName, JSUnusedGlobalSymbols
  export { className as class };
  export let comments: CommentWithUser[];
  $: amount = comments.length ?? 0;
  $: commenters = uniqueBy(comments.map(({ created_by }) => created_by), 'id');
</script>

<div class="inline-flex items-center leading-none {className}">
  <AvatarGroup users={commenters} />

  {#if amount === 0}
    <span>No Comments yet</span>
  {:else if amount === 1}
    <span>One Comment</span>
  {:else}
    <span>{amount} Comments</span>
  {/if}
</div>
