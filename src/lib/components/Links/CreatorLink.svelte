<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';
  import type { Creator } from '$lib/server/data/creator';

  export let creator: Pick<Creator, 'image' | 'id' | 'name'>;
</script>

<a href="/creators/{creator.id}" class="contents">
  <article class="flex items-center" id="creator-{creator.id}">
    <header class="contents">
      <div
        class="w-12 h-12 flex items-center justify-center flex-shrink-0 object-cover rounded-full shadow bg-gray-100">
        {#if creator.image}
          <img src="/creators/{creator.id}/picture" class="rounded-full w-full h-full object-cover"
               alt="Picture of {creator.name}">
        {:else}
          <Icon name="person" class="leading-none text-gray-500" />
        {/if}
      </div>
      <h3 class="ml-4 font-bold text-base">{creator.name}</h3>
    </header>
  </article>
</a>
