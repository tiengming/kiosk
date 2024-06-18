<script lang="ts">
  import { goto, invalidateAll } from '$app/navigation';
  import Button from '$lib/components/Form/Button.svelte';
  import Field from '$lib/components/Form/Field.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import { savable, trpc } from '$lib/trpc/client';
  import Gravatar from 'svelte-gravatar';
  import type { PageData } from './$types';
  import ProfileSection from './ProfileSection.svelte';
  import type { Authenticator } from '$lib/server/data/authentication/authenticator';
  import relativeTime from 'dayjs/plugin/relativeTime';
  import dayjs from 'dayjs';
  import AuthenticatorListItem from './AuthenticatorListItem.svelte';
  import { page } from '$app/stores';

  dayjs.extend(relativeTime);

  export let data: PageData;

  let loading: boolean = false;
  let updatedName: string = data.user.name || '';
  let updatedEmailAddress: string = data.user.email;

  async function updateName() {
    loading = true;

    try {
      await trpc($page).users.updateCurrent.mutate(savable({ name: updatedName }));
      await invalidateAll();
    } finally {
      loading = false;
    }
  }

  async function updateEmailAddress() {
    loading = true;

    try {
      await trpc($page).users.updateCurrentEmail.mutate(updatedEmailAddress);
      await invalidateAll();
    } finally {
      loading = false;
    }
  }

  function registerAuthenticator() {
    return goto('/auth/attestation');
  }

  function removeAuthenticator(authenticator: Authenticator) {
    return async () => {
      loading = true;

      try {
        await trpc($page).users.removeAuthenticator.mutate(authenticator.id);
        await invalidateAll();
      } finally {
        loading = false;
      }
    };
  }
</script>

<article>
  <header class="flex flex-col items-center justify-center">
    <Gravatar size={200} email={data.user.email} class="rounded-full bg-gray-50 overflow-hidden" />

    <h1 class="text-4xl font-bold dark:text-gray-300 mt-8 ml-4 flex items-center">
      {data.user.name}
    </h1>
  </header>

  <ProfileSection title="About you">
    <p slot="help">This is your profile information.</p>

    <Field
      bind:value={updatedName}
      autocomplete="name"
      label="Name"
      name="name"
      type="text"
      appendIcon="face"
    />

    <Button
      class="mt-6 lg:mt-8"
      slot="after"
      label="Update"
      disabled={updatedName === data.user.name}
      on:click={updateName}
    />
  </ProfileSection>

  <ProfileSection title="Your Email Address">
    <p slot="help">
      The email address you used to create the&nbsp;account.<br>
      We use this information to sign you in securely, and help you get access to your account in
      case you lose access to all registered authenticators.
    </p>

    <Field
      label="Email Address"
      name="email"
      bind:value={updatedEmailAddress}
      type="email"
      hint="We will send a confirmation email to the new address."
      appendIcon="email"
    />

    <Button
      class="mt-6 lg:mt-8"
      slot="after"
      label="Update"
      disabled={updatedEmailAddress === data.user.email}
      on:click={updateEmailAddress}
    />
  </ProfileSection>

  <ProfileSection title="Your Passkeys">
    <p slot="help">
      These are the passkeys you have previously&nbsp;registered.<br>
      Passkeys give you a simple and secure way to sign in without passwords by relying on methods
      like Face ID or Touch ID on Apple devices, or Hello on Windows to identify you when you sign
      in to supporting websites and&nbsp;apps.
    </p>

    <ul class="divide-y divide-gray-200 dark:divide-gray-800 mb-6 lg:mb-8">
      {#each data?.authenticators as authenticator}
        <li class="group" role="presentation">
          <AuthenticatorListItem
            authenticator={authenticator}
            disabled={loading}
            removable={data.authenticators.length > 1}
            on:remove={removeAuthenticator(authenticator)}
          />
        </li>
      {/each}
    </ul>

    <Button slot="after" label="Add new" on:click={registerAuthenticator} />
  </ProfileSection>

  <div class="block md:hidden mt-8">
    <Button class="w-full">
      <div class="mx-auto flex items-center">
        <Icon name="logout" class="mr-2" />
        <span>Sign out</span>
      </div>
    </Button>
  </div>
</article>
