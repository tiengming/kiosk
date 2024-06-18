<script lang="ts">
  import Field from '$lib/components/Form/Field.svelte';
  import TextareaInput from '$lib/components/Form/TextareaInput.svelte';

  let className: string = '';
  // noinspection ReservedWordAsName
  export { className as class };

  export let value: string | undefined;
  export let label: string | undefined = undefined;
  export let name: string;

</script>

<Field class="relative {className}" {label} {...$$restProps}>
  <svelte:fragment slot="control" let:id={id} let:disabled={disabled}>
    <TextareaInput {id} {name} disabled={disabled || undefined} bind:value />
  </svelte:fragment>
</Field>
