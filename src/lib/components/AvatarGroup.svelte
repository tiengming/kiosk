<script lang="ts">
  import type { User } from '$lib/server/data/authentication/user';
  import Avatar from '$lib/components/Avatar.svelte';

  export let users: User[] = [];
  export let size = 32;
</script>

<ul role="list" class="flex items-center group space-x-1">
  {#each users as user}
    <li
      class="-translate-x-1/2 first:translate-x-0 group-hover:translate-x-0 transition"
      title={user.name}
    >
      <Avatar user={user} {size} />
    </li>
  {/each}
</ul>
