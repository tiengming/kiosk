<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';

  export let items: { link: string; title: string }[] = [];
</script>

<nav class="mt-1">
  {#if items.length > 1}
    <ul class="flex items-center">
      {#each items as { link, title }, index}
        {#if index > 0}
          <li class="contents group">
            <Icon name="chevron_right" class="text-gray-500 leading-none" />
          </li>
        {/if}
        <li class="contents group">
          <a href={link} class="hover:bg-gray-50 dark:hover:bg-gray-900 rounded py-2 px-2 leading-none transition">
            <span>{title}</span>
          </a>
        </li>
      {/each}
    </ul>
  {/if}
</nav>
