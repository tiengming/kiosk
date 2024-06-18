<script lang="ts">
  import { enhance } from '$app/forms';
  import Button from '$lib/components/Form/Button.svelte';
  import Icon from '$lib/components/Icon.svelte';

  export let clientName: string;
  export let scopes: {
    id: string;
    description: string | null;
  }[];
</script>

<article>
  <header class="text-gray-700 dark:text-gray-400">
    <h3><strong>{clientName}</strong> is requesting access to your account.</h3>
    <p>This will allow <strong>{clientName}</strong> to:</p>
  </header>

  <form method="post" use:enhance>
    <slot />

    <ul class="flex flex-col mt-2">
      {#each scopes as scope}
        <li class="flex items-center justify-between">
          <strong class="text-sm">{scope.description ?? ''}</strong>

          <Button icon subtle class="ml-2" target="_blank" href="/help/oauth/scopes/#scope-{scope.id}">
            <Icon name="info" class="leading-none" />
          </Button>
          <!-- TODO: Depending on the client, we may let the user choose the scopes here -->
          <!--<ToggleField-->
          <!--  class="mb-0 flex-grow font-semibold"-->
          <!--  name="scopes[]"-->
          <!--  label={scope.description ?? ''}-->
          <!--  readonly-->
          <!--  value-->
          <!--/>-->
        </li>
      {/each}
    </ul>

    <div class="flex justify-end items-center mt-4">
      <Button class="order-2" type="submit" formaction="?/grantConsent">Allow</Button>
      <Button class="order-1 mr-2" subtle type="submit" formaction="?/rejectConsent">Deny</Button>
    </div>
  </form>
</article>
