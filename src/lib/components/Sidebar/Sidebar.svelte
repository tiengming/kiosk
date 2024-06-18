<script lang="ts">
  import Field from '$lib/components/Form/Field.svelte';
  import HeaderNavLink from '$lib/components/HeaderNavLink.svelte';
  import AccountPromotionBanner from '$lib/components/Sidebar/AccountPromotionBanner.svelte';
  import AddBookButton from '$lib/components/Sidebar/AddBookButton.svelte';
  import CollectionsList from '$lib/components/Sidebar/CollectionsList.svelte';
  import CurrentUser from '$lib/components/Sidebar/CurrentUser.svelte';
  import Logo from '$lib/components/Sidebar/Logo.svelte';
  import { createEventDispatcher } from 'svelte';
  import type { User } from '$lib/server/data/authentication/user';
  import type { Collection } from '$lib/server/data/collection';
  import type { MaybePromise } from '$lib/utilities';

  let className: string = '';
  // noinspection ReservedWordAsName
  export { className as class };
  export let collections: MaybePromise<Collection[]>;
  export let user: User | undefined = undefined;

  let searchTerm: string = '';

  const dispatch = createEventDispatcher<{ upload: null }>();

  function openUploadModal() {
    dispatch('upload', null);
  }
</script>

<nav class="{className} md:min-w-[16rem]">
  <div
    class="flex flex-col h-screen sticky top-0">

    <!-- Logo -->
    <Logo />

    <div class="flex flex-col h-full max-h-full overflow-y-scroll py-1">
      <!-- Search bar -->
      <div class="hidden md:contents">
        <Field class="mx-4" placeholder="Search" type="search" bind:value={searchTerm} />
      </div>

      <ul class="flex flex-col px-4 md:mt-8 space-y-4">
        <li class="mb-4 md:mb-1 pl-2 border-b md:border-none">
          <span class="hidden md:inline text-gray-600 text-sm font-bold">Discovery</span>
        </li>

        <HeaderNavLink to="/discover/featured" title="Featured" icon="local_library" />
        <HeaderNavLink to="/discover" title="Browse" icon="local_library" />
      </ul>

      <!-- Main navigation -->
      <ul class="flex flex-col px-4 md:mt-8 space-y-4">
        <li class="mb-4 md:mb-1 pl-2 border-b md:border-none">
          <span class="hidden md:inline text-gray-600 text-sm font-bold">Library</span>
        </li>

        <HeaderNavLink to="/creators" title="Creators" icon="person" />
        <HeaderNavLink to="/books" title="Books" icon="book" />
        <HeaderNavLink to="/publishers" title="Publishers" icon="domain" />
      </ul>

      <!-- User collections -->
      {#if user}
        <CollectionsList {collections} />
      {/if}

      <!-- Navigation actions area -->
      {#if user}
        <AddBookButton on:click={openUploadModal} />
      {:else}
        <AccountPromotionBanner />
      {/if}
    </div>

    <!-- User account area -->
    <div class="flex items-center px-4 py-4">
      {#if user}
        <CurrentUser email={user.email} name={user.name} />
      {/if}
    </div>
  </div>
</nav>
