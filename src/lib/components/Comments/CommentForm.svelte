<script lang="ts" context="module">
  export type SubmitEvent = CustomEvent<{

    /**
     * Text content of the new comment. May contain multiple lines.
     */
    content: string;

    /**
     * A helper function to reset the comment form to its original state.
     * Should be called _after_ the comment has been successfully submitted.
     */
    reset: () => void;
  }>;
</script>

<script lang="ts">
  import TextareaInput from '$lib/components/Form/TextareaInput.svelte';
  import { createEventDispatcher } from 'svelte';

  let className = '';
  // noinspection ReservedWordAsName, JSUnusedGlobalSymbols
  export { className as class };

  export let disabled = false;
  let content: string;

  const dispatch = createEventDispatcher<{
    submit: SubmitEvent['detail'];
  }>();

  function reset() {
    content = '';
  }

  function submit() {
    dispatch('submit', { content, reset });
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();

      if (event.shiftKey) {
        return;
      }

      submit();
    }
  }
</script>

<div class="flex items-center mt-4 {className}">
  <TextareaInput
    bind:value={content}
    {disabled}
    class="w-full grow rounded-xl dark:bg-gray-900 border-gray-300 dark:border-gray-800 shadow-lg
    focus-within:shadow-blue-500/10 transition"
    id="comment"
    name="content"
    placeholder="Add Comment..."
    on:keydown={handleKeydown}
  />
</div>
