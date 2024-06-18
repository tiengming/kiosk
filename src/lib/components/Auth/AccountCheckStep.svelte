<script lang="ts">
  import Button from '$lib/components/Form/Button.svelte';
  import Field from '$lib/components/Form/Field.svelte';

  export let loading: boolean = false;
  export let email: string;
  export let action: string;
</script>

<form method="POST" action={action} {...$$restProps}>
  <!-- svelte-ignore a11y-autofocus -->
  <Field
    bind:value={email}
    label="Email Address"
    class="max-w-lg"
    name="email"
    placeholder="jane@doe.com"
    autocomplete="email webauthn"
    disabled="{loading}"
    type="email"
    autofocus
    required
  />

  <Button label="Continue" class="mt-8" disabled={loading} type="submit" />
</form>
