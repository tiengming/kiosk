<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';
  import Avatar from '$lib/components/Avatar.svelte';
  import Button from '$lib/components/Form/Button.svelte';
  import InviteUserModal from './InviteUserModal.svelte';
  import CreateUserModal from './CreateUserModal.svelte';
  import { page } from '$app/stores';
  import { extractPaginationParametersFromUrl, trpc } from '$lib/trpc/client';
  import PaginatedList from '$lib/components/Pagination/PaginatedList.svelte';

  $: pagination = extractPaginationParametersFromUrl($page.url);
  $: users = loadUsers(pagination);
  let inviteOpen = false;
  let createOpen = false;

  function showInvitationModal() {
    inviteOpen = true;
  }

  function showCreateModal() {
    createOpen = true;
  }

  function loadUsers(pagination: { page?: number; per_page?: number }) {
    return trpc($page).users.list.query(pagination);
  }
</script>

<article>
  <header class="flex flex-wrap lg:flex-nowrap lg:flex-row items-start lg:items-center justify-between mb-8">
    <p class="mr-auto mb-4 lg:mb-0 w-full lg:w-auto">
      On this page, you can manage the accounts of your family&nbsp;members.
    </p>

    <Button on:click={showCreateModal} subtle class="ml-auto lg:ml-0">
      Create&nbsp;Account
    </Button>
    <Button on:click={showInvitationModal} class="ml-2">Invite&nbsp;someone</Button>
  </header>

  <PaginatedList data={users} let:items>
    <ul role="group" class="grid lg:grid-cols-2 gap-4">
      {#each items as user}
        <li role="presentation">
          <article
            class="relative flex flex-col rounded-3xl p-2 pl-3 shadow-md dark:shadow-blue-500/10
            bg-gray-50 dark:bg-gray-800/75"
          >
            <header class="flex items-center">
              <Avatar
                {user}
                size={48}
                class="rounded-full min-w-max shrink-0 w-12 h-12 bg-gray-50 dark:bg-gray-900
                shadow-lg ring-1 ring-gray-300"
              />

              <div
                role="presentation"
                class="absolute top-0 right-0 flex justify-center items-center w-8 h-8 m-2
                bg-gray-200 dark:bg-gray-700 rounded-full leading-none"
              >
                <Icon name="shield_person" />
                <!--<Icon name="family_star"/>-->
              </div>

              <div class="ml-4 overflow-hidden overflow-ellipsis max-w-fit">
                <h3 class="font-bold text-lg">{user.name}</h3>
                <span class="text-gray-500">{user.email}</span>
              </div>
            </header>

            <footer class="mt-4 pb-2 flex items-center space-x-2">
              <Button small>Edit</Button>
              <Button small subtle>Remove</Button>
            </footer>
          </article>
        </li>
      {/each}
    </ul>
  </PaginatedList>
  <InviteUserModal bind:open={inviteOpen} />
  <CreateUserModal bind:open={createOpen} />
</article>
