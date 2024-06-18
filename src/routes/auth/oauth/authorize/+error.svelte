<script lang="ts">
  import { page } from '$app/stores';
  import Icon from '$lib/components/Icon.svelte';

  let status: number;
  $: status = $page.status ?? 500;
  $: title = $page.error?.title ?? status;
  $: message = $page.error?.message.replace(/\.$/, '') + '.';
</script>

<article class="error my-16 mx-auto max-w-prose">
  <header class="mb-4">
    <h1 class="text-3xl font-bold flex items-center">
      <Icon name="gpp_maybe" weight={700} class="text-orange-500 text-3xl leading-none" />
      <span class="ml-2">Integration Authorization failed</span>
    </h1>
  </header>

  <div class="flex flex-col space-y-1 text-lg text-gray-700">
    <p>
      The integration you're trying to connect to Kiosk had an error and couldn't connect to
      your&nbsp;account properly. To prevent unauthorized access to your data, Kiosk has denied
      the connection.
    </p>
    <p>
      The reason for this error may be temporary issues, an outdated integration, or simply a bug in
      its code; in some cases, though, this may also hint at a malicious application or someone
      trying to do something more nefarious.
    </p>
    <p>
      If the problems persist, try to contact the integration author or the Kiosk development team,
      and be careful.
    </p>
  </div>
  <details class="mt-6 p-4 bg-white dark:bg-black rounded-2xl shadow-lg shadow-black/5">
    <summary class="font-medium text-sm cursor-pointer text-gray-700">
      Technical Details
    </summary>

    <ul class="border-t border-gray-200 dark:border-gray-600 mt-2 pt-2">
      <li>
        <span>Error Code:</span>
        <code class="text-sm" data-testid="oauthErrorType">{title}</code>
      </li>
      <li>
        <span>HTTP Status:</span>
        <code class="text-sm" data-testid="oauthErrorStatus">{status}</code>
      </li>
      <li>
        <span>Description:</span>
        <span data-testid="oauthErrorDescription">{message}</span>
      </li>
    </ul>
  </details>
</article>

