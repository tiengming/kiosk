<script lang="ts">
  import Modal from '$lib/components/Modal.svelte';
  import ToggleField from '$lib/components/Form/ToggleField.svelte';
  import Field from '$lib/components/Form/Field.svelte';
  import Button from '$lib/components/Form/Button.svelte';
  import { z } from 'zod';
  import { trpc } from '$lib/trpc/client';
  import { page } from '$app/stores';
  import LoadingSpinner from '$lib/LoadingSpinner.svelte';
  import { fly } from 'svelte/transition';
  import HelpLink from '$lib/components/HelpLink.svelte';

  export let open: boolean = false;
  let emailAddress = '';
  let name = '';
  let birthDate: string | undefined = undefined;
  let childAccount = false;
  $: invalid = !validateName(name) || !validateEmailAddress(emailAddress);
  let loading = false;
  let error: string | undefined = undefined;

  function validateName(name: string) {
    try {
      return !!(name && z.string().parse(name));
    } catch {
      return false;
    }
  }

  function validateEmailAddress(emailAddress: string) {
    try {
      return !!(emailAddress && z.string().email().parse(emailAddress));
    } catch {
      return false;
    }
  }

  async function createAccount() {
    if (loading || invalid) {
      return;
    }

    loading = true;
    error = undefined;

    try {
      await trpc($page).users.createUser.mutate({
        name,
        emailAddress,
        role: childAccount ? 'adult' : 'child',
        birthDate: birthDate || undefined as Date | undefined
      });
    } catch (cause) {
      error = cause instanceof Error
        ? cause.message
        : String(cause);
    } finally {
      loading = false;
    }
  }
</script>

<Modal bind:open class="max-w-96">
  <h1 slot="header" class="font-bold text-lg">Create Account</h1>

  <div class="grid grid-cols-1 gap-4">
    <p class="text-sm text-gray-600 dark:text-gray-400">
      Create an account on behalf of a family member. You can change all settings later on, so don't
      worry about omitting some things for now.
    </p>

    <Field
      bind:value={name}
      label="Name"
      required
      autofocus
      disabled={loading}
      on:submit={createAccount}
    />
    <Field
      bind:value={emailAddress}
      label="Email address"
      type="email"
      required
      disabled={loading}
      on:submit={createAccount}
    />
    <ToggleField
      label="This is a Kids' Account"
      disabled={loading}
      bind:value={childAccount}
      hint="Kids accounts will be restricted access to content."
    />

    {#if childAccount}
      <div transition:fly={{duration: 200, delay: 20, y: -16}}>
        <Field
          bind:value={birthDate}
          disabled={loading}
          label="Birthdate"
          type="date"
          hint="Add a birthdate to only show age-appropriate content."
          on:submit={createAccount}
        />
      </div>
    {/if}
  </div>

  <footer class="mt-6">
    <div class="flex items-center space-x-2">
      <Button on:click={createAccount} disabled={invalid || loading}>Submit</Button>
      <HelpLink subtle topic="users.create" />

      {#if loading}
        <LoadingSpinner class="ml-auto" />
      {/if}
    </div>

    {#if error}
      <div
        role="alert"
        transition:fly={{duration: 200, delay: 20, y: -16}}
        class="flex flex-col mt-4 bg-red-100 text-red-900 rounded-lg ring-2 ring-red-200 px-4 py-2
        shadow-md shadow-red-500/10 text-sm"
      >
        <strong class="mb-1">Something unexpected happened</strong>
        <p>The user account could not be created: {error}</p>
      </div>
    {/if}
  </footer>
</Modal>
