<script lang="ts">
  import type { DigitsChangeEvent } from '$lib/components/Auth/Digits/DigitInput.svelte';
  import DigitInput from '$lib/components/Auth/Digits/DigitInput.svelte';
  import Button from '$lib/components/Form/Button.svelte';
  import type { SubmitFunction } from './$types';
  import { tick } from 'svelte';
  import { enhance } from '$app/forms';
  import type { ZodIssue } from 'zod';
  import ZodIssues from '$lib/components/Form/ZodIssues.svelte';
  import { page } from '$app/stores';

  export let email: string;
  export let issues: ZodIssue[];
  let formRef: HTMLFormElement;
  let loading = false;

  $: passcode = undefined as string | undefined;
  $: previous = $page.url.searchParams.get('previous') || '/';

  async function verifyPasscode(event: DigitsChangeEvent) {
    ({ value: passcode } = event.detail);

    // Wait for a moment for the hidden form input to update
    await tick();

    // Then submit the form
    formRef.requestSubmit();
  }

  const handle = function handle({ action, cancel }) {
    if (action.search === '?/verify' && !passcode) {
      return cancel();
    }

    // Reset the issues
    issues = [];
    loading = true;

    return async ({ update }) => {
      loading = false;

      return update();
    };
  } satisfies SubmitFunction;
</script>

<form
  method="post"
  use:enhance={handle}
  action="?/verify"
  class="flex flex-col max-w-md"
  bind:this={formRef}
>

  <!-- If the client does not forward the previous URL cookie, we'll include it as a fallback -->
  <input type="hidden" name="previous" value={previous} />

  <p class="block mb-4 text-gray-700 dark:text-gray-400">
    Please enter the passcode that was sent to&nbsp;"{email}".
  </p>

  <input type="hidden" name="email" value={email} required />
  <input type="hidden" name="passcode" value={passcode} required />
  <DigitInput numeric on:input={verifyPasscode} disabled={loading} />

  <div class="flex justify-end items-center">
    <Button
      label="Verify"
      class="ml-2 order-2"
      disabled={loading}
      type="submit"
    />

    <Button
      label="Send another"
      class="order-1"
      disabled={loading}
      type="submit"
      formaction="?/request"
      subtle
    />
  </div>

  {#if issues.length > 0}
    <ZodIssues {issues} fields={['passcode']} />
  {/if}
</form>
