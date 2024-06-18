<script lang="ts">
  import { onMount } from 'svelte';
  import { ceremony } from './webauthn';
  import type { ActionData, PageData } from './$types';
  import { browserSupportsWebAuthn } from '@simplewebauthn/browser';
  import EmailForm from './EmailForm.svelte';
  import PasscodeForm from './PasscodeForm.svelte';
  import type { ZodIssue } from 'zod';
  import PageHeader from '$lib/components/Page/PageHeader.svelte';

  export let data: PageData;
  export let form: ActionData;

  let issues: ZodIssue[];
  let webauthnAvailable = true;
  let email: string = '';

  $: issues = form?.issues ?? [];

  async function webauthn() {
    if (!browserSupportsWebAuthn()) {
      webauthnAvailable = false;

      return;
    }

    try {
      await ceremony(fetch);
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error;
      }

      webauthnAvailable = false;
      issues.push({
        code: 'custom',
        path: ['webauthn'],
        message: error.message
      });
    }
  }

  onMount(() => webauthn());
</script>

<article class="max-w-sm mx-auto bg-white shadow-2xl shadow-gray-500/5 rounded-2xl p-6">
  <PageHeader title="Sign in" />

  {#if form?.sent}
    <PasscodeForm bind:email bind:issues />
  {:else}
    <EmailForm bind:email bind:issues {webauthnAvailable} />
  {/if}
</article>
