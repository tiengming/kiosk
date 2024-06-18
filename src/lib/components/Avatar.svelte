<script lang="ts">
  import Gravatar from 'svelte-gravatar';
  import type { User } from '$lib/server/data/authentication/user';

  export let user: Pick<User, 'email'>;
  export let size = 32;
</script>

<Gravatar email={user.email} {size} class="rounded-full" {...$$restProps} />
