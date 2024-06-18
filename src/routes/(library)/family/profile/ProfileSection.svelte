<script lang="ts">
  export let title: string | undefined = undefined;
  export let help: string | undefined = undefined;
</script>

<section class="mt-8">
  <header>
    <h2 class="text-lg font-bold dark:text-gray-400 mb-2">
      {#if $$slots.title || title}
        <slot name="title">{title}</slot>
      {/if}
    </h2>
  </header>

  <div class="flex flex-col lg:flex-row">
    <slot name="before" />

    <div class="lg:w-1/3 xl:w-1/4 w-full text-gray-400 dark:text-gray-600 text-sm pb-4 lg:pb-0 lg:pr-8">
      {#if $$slots?.help}
        <slot name="help">{help}</slot>
      {/if}
    </div>

    <div class="flex flex-col lg:w-2/3 xl:w-3/4 w-full bg-gray-100 dark:bg-gray-900 shadow-inner-sm
    rounded-xl border p-4 dark:border-gray-950">
      <slot />

      {#if $$slots.after}
        <div class="mt-auto">
          <slot name="after" />
        </div>
      {/if}
    </div>
  </div>

  {#if $$slots.footer}
    <footer class="mt-auto">
      <slot name="footer" />
    </footer>
  {/if}
</section>
