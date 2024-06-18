<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import Icon from '$lib/components/Icon.svelte';
  import Gravatar from 'svelte-gravatar';
  import { tick } from 'svelte';
  import { page } from '$app/stores';

  export let email: string;
  export let name: string | null;
  $: name = name || inferNameFromEmail(email);

  async function logout() {
    await fetch('/auth/logout', {
      method: 'POST'
    });
    await tick();
    await invalidateAll();
  }

  function inferNameFromEmail(email: string) {
    return email?.split('@')[0];
  }
</script>

<div class="flex items-stretch w-full space-x-1">
  <a href="/family/profile" class="flex justify-center md:justify-start items-center flex-grow
   outline-0 focus-visible:ring-2 rounded-md -ml-1 p-1">
    <Gravatar {email} class="rounded-full overflow-hidden" />
    <span class="hidden md:inline ml-4 font-bold overflow-hidden whitespace-nowrap overflow-ellipsis max-w-full">
      {name}
    </span>
  </a>

  <a
    href="/family/settings"
    class="hidden md:block p-4 rounded-md leading-none bg-transparent hover:bg-gray-200
    dark:hover:bg-gray-700 focus-visible:bg-gray-200 dark:focus-visible::bg-gray-700 outline-0
    focus-visible:ring-2 transition"
    class:text-blue-500={$page.url.pathname === "/family/settings"}
  >
    <Icon name="tune" />
  </a>

  <button
    class="hidden md:block p-4 rounded-md leading-none bg-transparent hover:bg-gray-200
    dark:hover:bg-gray-700 focus-visible:bg-gray-200 dark:focus-visible::bg-gray-700 outline-0
    focus-visible:ring-2 transition"
    on:click={logout}>
    <Icon name="logout" />
  </button>
</div>
