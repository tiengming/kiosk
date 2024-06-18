<script lang="ts">
  import Modal from '$lib/components/Modal.svelte';
  import Field from '$lib/components/Form/Field.svelte';
  import Button from '$lib/components/Form/Button.svelte';
  import QrCode from '$lib/components/QrCode.svelte';
  import { fly } from 'svelte/transition';
  import ToggleField from '$lib/components/Form/ToggleField.svelte';
  import { trpc } from '$lib/trpc/client';
  import { page } from '$app/stores';
  import dayjs from 'dayjs';
  import { z } from 'zod';
  import { debounce } from 'svelte-reactive-debounce';
  import { writable } from 'svelte/store';
  import CopyToClipboard from '$lib/components/CopyToClipboard.svelte';

  export let open: boolean = false;
  let loading: boolean = false;
  const emailAddress = writable('');
  const debounced = debounce(emailAddress, 250);
  let childAccount = false;
  let invitationLink: string | undefined = undefined;
  $: emailAddressValid = validate($emailAddress);
  $: generateInvitationLink($debounced, childAccount);

  async function generateInvitationLink(email: string, childAccount: boolean) {
    if (!validate(email)) {
      return;
    }

    loading = true;

    try {
      invitationLink = await trpc($page).users.generateInvitationLink.query({
        email,
        role: childAccount ? 'child' : 'adult',
        expiresAt: dayjs().add(14, 'days').toDate()
      });
    } finally {
      loading = false;
    }
  }

  function validate(emailAddress: string | undefined) {
    try {
      return !!(emailAddress && z
        .string()
        .email('Not a valid email address')
        .parse(emailAddress));
    } catch {
      return false;
    }
  }
</script>

<Modal bind:open class="max-w-96">
  <h1 slot="header" class="font-bold text-lg">Invite someone</h1>

  <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
    Invite someone to your family library by entering their email address below.
  </p>

  <Field bind:value={$emailAddress} label="Email address" type="email" required />
  <ToggleField
    class="mt-2"
    label="This is a Kids Account"
    bind:value={childAccount}
    hint="Kids accounts will be restricted access to content."
  />

  <footer class="mt-6">
    <div class="flex items-center space-x-4">
      <Button disabled={!emailAddressValid || loading}>Send invitation</Button>
      <CopyToClipboard
        disabled={!invitationLink || loading}
        value={invitationLink ?? ''}
        label="Copy Link"
        completeLabel="Copied link"
        subtle
      />
    </div>

    {#if emailAddressValid && invitationLink}
      <div transition:fly={{duration: 150, y: 16}} class="mt-6">
        <QrCode
          maskCenter
          value={invitationLink}
          class="p-4 bg-gray-100 dark:bg-gray-900 border dark:border-gray-800 rounded-lg"
        >
          <img src="/logo.svg" alt="" class="w-full h-full" />
        </QrCode>
      </div>
    {/if}
  </footer>
</Modal>
