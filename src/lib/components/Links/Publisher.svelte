<script lang="ts">
  import type { Publisher } from '@prisma/client';
  import Icon from '$lib/components/Icon.svelte';

  export let publisher: Publisher;
</script>

<a href="/publishers/{publisher.id}" class="contents">
  <article class="flex items-center">
    <header class="contents">
      <div
        class="w-12 h-12 flex items-center justify-center flex-shrink-0 object-cover rounded-full shadow bg-gray-100">
        {#if publisher.image}
          <img src="/publishers/{publisher.id}/logo"
               class="rounded-full w-full h-full object-cover"
               alt="Logo of {publisher.name}">
        {:else}
          <Icon name="domain" class="leading-none text-gray-500" />
        {/if}
      </div>
      <h3 class="ml-4 font-bold text-base">{publisher.name}</h3>
    </header>
  </article>
</a>
