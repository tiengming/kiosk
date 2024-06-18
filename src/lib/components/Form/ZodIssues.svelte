<script lang="ts">
  import type { ZodIssue } from 'zod';

  export let issues: ZodIssue[] = [];
  export let fields: (string | number)[] | null = null;

  $: filteredIssues = fields !== null
    ? issues.filter(issue => fields.includes(issue.path[0]))
    : issues;
</script>

<ul>
  {#each filteredIssues as { message, path }}
    <li>{path[0]}: {message}</li>
  {/each}
</ul>
