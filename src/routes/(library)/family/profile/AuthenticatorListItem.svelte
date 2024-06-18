<script lang="ts">
  import type { Authenticator } from '$lib/server/data/authentication/authenticator';
  import dayjs from 'dayjs';
  import silkLogo from '@browser-logos/silk/silk.png';
  import safariMobileLogo from '@browser-logos/safari-ios/safari-ios.svg';
  import safariLogo from '@browser-logos/safari/safari.png';
  import chromeLogo from '@browser-logos/chrome/chrome.svg';
  import chromiumLogo from '@browser-logos/chromium/chromium.svg';
  import edgeLogo from '@browser-logos/edge/edge.svg';
  import yandexLogo from '@browser-logos/yandex/yandex.png';
  import braveLogo from '@browser-logos/brave/brave.svg';
  import firefoxLogo from '@browser-logos/firefox/firefox.svg';
  import webkitLogo from '@browser-logos/webkit/webkit.svg';
  import { createEventDispatcher, tick } from 'svelte';
  import Button from '$lib/components/Form/Button.svelte';
  import Icon from '$lib/components/Icon.svelte';

  export let authenticator: Authenticator;
  export let removable: boolean = true;
  export let disabled: boolean = false;

  const dispatch = createEventDispatcher<{
    remove: Authenticator;
  }>();

  let editing = false;
  let nameInput: HTMLInputElement;
  $: agent = authenticator.agent?.toLowerCase() || 'webkit';
  $: icon = icons[agent] || webkitLogo;

  const icons: Record<string, string> = {
    kindle: silkLogo,
    silk: silkLogo,
    'mobile safari': safariMobileLogo,
    safari: safariLogo,
    chrome: chromeLogo,
    chromium: chromiumLogo,
    edge: edgeLogo,
    yandex: yandexLogo,
    brave: braveLogo,
    firefox: firefoxLogo,
    webkit: webkitLogo
  };

  function remove() {
    dispatch('remove', authenticator);
  }

  async function editName() {
    editing = true;
    await tick();
    nameInput.focus({ preventScroll: true });
    nameInput.select();
  }
</script>

<div class="flex items-start md:items-center group-first:pt-0 group-last:pb-0 py-2">
  <img
    class="w-8 mt-1 md:mt-0"
    src={icon}
    alt="Logo of the browser used to set up the authenticator"
  >

  <div class="flex flex-col">
    <div class="ml-4 md:mr-2 font-bold w-full dark:text-gray-300">
      {#if !editing}
        <button on:click={editName}>
          <strong>{authenticator.handle}</strong>
          <Icon name="edit" class="text-gray-500 text-sm" />
        </button>
      {:else}
        <input
          type="text"
          {disabled}
          value={authenticator.handle}
          bind:this={nameInput}
          class="w-full py-0 px-0.5 -mx-0.5 focus:outline-0 focus:ring-2 rounded border-none bg-transparent"
        />
      {/if}

    </div>

    <span class="ml-4 text-gray-500 text-sm">
      {#if authenticator.last_used_at !== null}
        {@const lastUsed = new Date(authenticator.last_used_at)}
        <time datetime="{lastUsed.toISOString()}">
          last used {dayjs(lastUsed).fromNow()}
        </time>
      {:else}
        <span>not used yet</span>
      {/if}
    </span>
  </div>

  {#if removable}
    <Button
      subtle
      small
      class="ml-auto mt-1 lg:mt-0 leading-none"
      on:click={remove}
      {disabled}
    >
      <Icon name="delete_forever" class="text-2xl" />
    </Button>
  {/if}
</div>
