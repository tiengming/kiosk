<script lang="ts">
  import Button from '$lib/components/Form/Button.svelte';
  import Field from '$lib/components/Form/Field.svelte';
  import { enhance } from '$app/forms';
  import type { ZodIssue } from 'zod';
  import { page } from '$app/stores';

  export let email: string;
  export let issues: ZodIssue[];
  export let webauthnAvailable: boolean = false;

  $: emailIssue = issues
    .find(issue => issue.path[0] === 'email')
    ?.message;
  $: webauthnIssue = issues.find(issue => issue.path[0] === 'webauthn')
    ?.message;
  $: previous = $page.url.searchParams.get('previous') || '/';
</script>

<form method="POST" action="?/request" use:enhance>

  <!-- If the client does not forward the previous URL cookie, we'll include it as a fallback -->
  <input type="hidden" name="previous" value={previous} />

  <Field
    bind:value={email}
    label="Email Address"
    class="max-w-lg"
    name="email"
    placeholder="jane@doe.com"
    autocomplete="email webauthn"
    type="email"
    required
    error={emailIssue}
  />

  {#if webauthnAvailable && webauthnIssue}
    <span class="mt-4 text-red-500">{webauthnIssue}</span>
  {/if}

  <div class="flex items-center justify-end">
    <Button label="Continue" class="mt-8" type="submit" />
  </div>
</form>
