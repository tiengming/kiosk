<script lang="ts">
  import AutocompleteInput from '$lib/components/Form/AutocompleteInput.svelte';
  import { trpc } from '$lib/trpc/client';
  import { page } from '$app/stores';

  export let name = 'language';
  export let label: string | undefined = undefined;
  export let value: string | undefined;
  export let query: string | undefined = undefined;

  async function fetchSuggestions(term: string) {
    const languages = await trpc($page).languages.autocomplete.query(term);

    return languages.map(({ iso_639_3, name }) => ({ id: iso_639_3, value: name }));
  }
</script>

<AutocompleteInput
  {label}
  {name}
  bind:value={value}
  bind:query={query}
  suggestions={fetchSuggestions}
/>
