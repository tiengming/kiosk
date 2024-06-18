<script lang="ts">
  import type { AuthenticationColorScheme } from '$lib/../database';
  import { page } from '$app/stores';
  import { trpc } from '$lib/trpc/client';
  import type { ChangeEventHandler } from 'svelte/elements';
  import { preference } from '$lib/actions/theme';

  let colorScheme: AuthenticationColorScheme = $page.data.user.color_scheme;
  let loading = false;

  const updateColorScheme: ChangeEventHandler<HTMLSelectElement> = async function updateColorScheme(event) {
    loading = true;

    // TODO: Why is this hack necessary? The binding seems to be outdated here
    colorScheme = (event.target as HTMLSelectElement)?.value as AuthenticationColorScheme;

    try {
      await trpc($page).users.updateCurrent.mutate({ colorScheme });
      preference.set(colorScheme);
    } finally {
      loading = false;
    }
  };
</script>

<label>
  <span>Color Scheme</span>
  <select on:change={updateColorScheme} bind:value={colorScheme} disabled={loading} class="text-current bg-transparent">
    <option value="system">System</option>
    <option value="dark">Dark</option>
    <option value="light">Light</option>
  </select>
</label>
