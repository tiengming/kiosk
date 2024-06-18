<script lang="ts">
  import Button from '$lib/components/Form/Button.svelte';
  import { goto } from '$app/navigation';

  function goBack() {
    return goto('/auth/login');
  }
</script>

<div>
  <strong class="block mb-1 text-lg">No account by that name</strong>
  <p class="leading-relaxed">
    We couldn't find an account for your email address. Please make sure you've entered it correctly.
    <br>
    If you've been invited to join Kiosk, please make sure you're using the email address that the
    invitation was sent to and sign up using the link in the mail.
  </p>

  <Button label="Go Back" class="mt-8" type="button" on:click={goBack} />
</div>
