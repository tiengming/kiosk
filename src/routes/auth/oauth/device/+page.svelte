<script lang="ts">
  import type { ActionData, PageData } from './$types';
  import Button from '$lib/components/Form/Button.svelte';
  import { enhance } from '$app/forms';
  import DigitInput from '$lib/components/Auth/Digits/DigitInput.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import AuthorizationPrompt from '$lib/components/Auth/OAuth/AuthorizationPrompt.svelte';
  import { tick } from 'svelte';

  export let data: PageData;
  export let form: ActionData;

  let value = '';
  $: initialValue = data.userCode ?? '';
  $: error = form?.errors && 'user_code' in form.errors
    ? form.errors.user_code.join(', ')
    : undefined;

  let codeForm: HTMLFormElement;

  async function submitOnComplete() {
    await tick();

    codeForm.requestSubmit();
  }
</script>

<article class="max-w-sm mx-auto bg-white shadow-2xl shadow-gray-500/5 rounded-2xl p-6">
  <header class="mb-2">
    <h1 class="text-3xl font-medium font-serif">Connect a Device</h1>
  </header>

  {#if !form || error}
    <p class="text-gray-700">Enter the code displayed on your device.</p>
    <form class="grid gap-4 mt-8" method="post" action="?/code" use:enhance bind:this={codeForm}>
      <DigitInput
        bind:value
        {initialValue}
        name="user_code"
        separator
        autofocus
        {error}
        on:input={submitOnComplete}
      />

      <div class="justify-self-end flex items-center">
        <Button type="submit" label="Continue" disabled={value.length < 6} class="order-2" />
        <Button label="Help" subtle class="mr-2 order-1" />
      </div>
    </form>
  {:else if form.consented}
    <p class="text-gray-700">
      You're all set! The device has been successfully connected and should be ready to use.
    </p>
    <p class="text-gray-700 mt-1">
      Feel free to close this window now.
    </p>

    <div
      class="mx-auto mt-12 w-32 h-32 flex justify-center items-center rounded-full p-8 bg-green-100"
    >
      <Icon name="done_all" class="text-green-500 text-5xl" />
    </div>
  {:else if form.rejected}
    <p class="text-gray-700">
      The device connection has been rejected.
    </p>
    <p class="text-gray-700 mt-1">
      Feel free to close this window now.
    </p>

    <div class="mx-auto mt-12 w-32 h-32 flex justify-center items-center rounded-full p-8 bg-red-100">
      <Icon name="do_not_disturb_on" class="text-red-500 text-5xl" />
    </div>
  {:else if form.consentPending}
    <AuthorizationPrompt clientName={form.client.name ?? ''} scopes={form.client.scopes}>
      <input type="hidden" name="userCode" value="{form.userCode}" />
      <input type="hidden" name="deviceChallenge" value="{form.deviceChallenge}" />
    </AuthorizationPrompt>
  {/if}
</article>
