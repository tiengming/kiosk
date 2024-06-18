<script lang="ts" context="module">
  import type { Catalog } from './+page.svelte';

  export type CatalogActivityEvent = CustomEvent<{ catalog: Catalog }>;
  export type EnableCatalogEvent = CatalogActivityEvent;
  export type DisableCatalogEvent = CatalogActivityEvent;
</script>

<script lang="ts">
  import Toggle, { type ToggleEvent } from '$lib/components/Form/Toggle.svelte';
  import { createEventDispatcher } from 'svelte';
  import Icon from '$lib/components/Icon.svelte';
  import { parseCssColor, rgbToCssColor } from '$lib/colors';

  export let catalog: Catalog;
  $: backgroundColor = catalog.color ? rgbToCssColor(parseCssColor(`rgb${catalog.color}`), 0.25) : undefined;
  $: title = catalog.title ?? new URL(catalog.feed_url).hostname;

  export let disabled = false;

  const dispatch = createEventDispatcher<{
    enable: EnableCatalogEvent['detail'];
    disable: DisableCatalogEvent['detail'];
  }>();

  function toggle({ detail: active }: ToggleEvent) {
    if (disabled || catalog.active === active) {
      return;
    }

    dispatch(active ? 'enable' : 'disable', { catalog });
  }
</script>

<li
  class="rounded-3xl bg-gray-50 dark:bg-gray-900 shadow-inner-sm dark:shadow-none dark:ring
  dark:ring-gray-700/50"
>
  <div
    class="flex items-start p-4 rounded-3xl"
    style:background="linear-gradient(120deg, {backgroundColor} 5%, transparent 50%)"
  >
    <!-- region Catalog image -->
    <div class="bg-white h-10 w-10 shrink-0 rounded-full border flex justify-center items-center">
      {#if catalog.image_url}
        <img src={catalog.image_url} class="w-8 h-auto object-cover overflow-hidden rounded-full"
             alt="Logo of the catalog feed of {catalog.title}" />
      {:else}
        <Icon name="local_library" class="text-gray-500 dark:text-gray-400" />
      {/if}
    </div>
    <!-- endregion -->

    <!-- region Catalog metadata -->
    <div class="flex flex-col mx-2 overflow-hidden">

      <!-- region Catalog title -->
      <div class="flex md:items-center items-start flex-col md:flex-row">
        <strong class="leading-none text-inherit">{title}</strong>
        {#if catalog.credentials_required}
          <span
            class="mt-1 md:mt-0 md:ml-2 text-xs border rounded uppercase pl-1 pr-0.5 font-semibold text-orange-500
            dark:text-orange-400 border-current flex items-center whitespace-nowrap"
          >
            <span>
              Requires Auth<span class="hidden md:inline">entication</span>
            </span>
            <Icon
              name="lock"
              class="text-orange-500 dark:text-orange-400 text-xs leading-none ml-0.5"
              weight={800}
            />
          </span>
        {/if}
      </div>
      <!-- endregion -->

      <!-- region Catalog feed URL -->
      <a
        href={catalog.feed_url}
        target="_blank" rel="noopener nofollow"
        class="text-sm opacity-50 hover:underline focus-visible:underline outline-none
        focus-visible:text-gray-400 dark:focus-visible:text-gray-300 text-ellipsis max-w-full
        whitespace-nowrap overflow-hidden"
      >{catalog.feed_url}</a>
      <!-- endregion -->

      {#if catalog.description}
        <p class="mt-1">{catalog.description}</p>
      {/if}

      <a href={catalog.url} class="mt-2 text-blue-500 dark:text-blue-400 hover:underline">
        Visit website &raquo;
      </a>
    </div>
    <!-- endregion -->

    <!-- region Toggle -->
    <div class="ml-auto self-center flex items-center justify-center">
      <Toggle
        {disabled}
        size="medium"
        value={catalog.active}
        on:change={toggle}
      />
    </div>
    <!-- endregion -->
  </div>
</li>
