<script lang="ts" context="module">
  import type { PageData } from './$types';

  export type Book = PageData['book'];
  export type Creator = Awaited<PageData['creators']>[number];
  export type Publisher = Awaited<PageData['publisher']>;
  export type Rating = Awaited<PageData['ratings']>[number];
  export type Review = Awaited<PageData['reviews']>[number];
</script>

<script lang="ts">
  import 'bytemd/dist/index.css';
  import CollectionModal from './CollectionModal.svelte';
  import Meta from './Meta.svelte';
  import BookCover from '$lib/components/BookCover.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import ContentSection from '$lib/components/ContentSection.svelte';
  import HeaderButton from '../HeaderButton.svelte';
  import MarkdownContent from '$lib/components/MarkdownContent.svelte';
  import CommentsPanel from '$lib/components/Comments/CommentsPanel.svelte';
  import type { CommentWithUserAndReactions } from '$lib/server/data/comment';
  import ReviewWidget from './ReviewWidget.svelte';
  import RatingsWidget from './RatingsWidget.svelte';
  import HeaderBackground from './HeaderBackground.svelte';
  import RatingWidget from './RatingWidget.svelte';

  export let data: PageData;
  $: book = data.book;
  $: creators = data.creators;
  $: publisher = data.publisher;
  $: ratings = data.ratings;
  $: reviews = data.reviews;

  const comments: CommentWithUserAndReactions[] = [];
  let commentsPanel: CommentsPanel;

  let collectionModalOpen = false;
</script>

<article>
  <HeaderBackground
    class="h-72 sticky top-0 border-b dark:border-gray-800 shadow transition"
    blurhash={book.cover_blurhash}
    data-animatable="blur"
  />

  <header class="sticky top-0 flex flex-col mb-10">
    <ContentSection
      class="grid gap-x-12 gap-y-10 grid-cols-[max-content_auto] grid-rows-[auto_1fr] transition will-change-auto -mt-24"
      data-animatable="header">
      <!-- region Book Cover -->
      <div data-animatable="cover" class="row-span-2">
        <BookCover
          book={book.id}
          edition={book.edition_id}
          title={book.title}
          blurhash={book.cover_blurhash}
          class="max-w-xs rounded-md shadow-lg max-h-80"
          imageClasses="aspect-[50/81]"
        />
      </div>
      <!-- endregion -->

      <!-- region Header Actions -->
      <nav class="flex flex-grow -mt-px h-24 items-center space-x-2" data-animatable="header-links">
        <HeaderButton class="-ml-1 mr-auto" tag="a" href=".">
          <Icon name="chevron_left" />
          <span class="ml-1">Back</span>
        </HeaderButton>

        <HeaderButton class="ml-auto" on:click={() => collectionModalOpen = true}>
          <Icon name="library_add" />
          <span class="ml-2">Add to collection</span>
        </HeaderButton>

        <HeaderButton tag="a" href="/books/{book.id}/edit">
          <Icon name="edit" />
          <span class="ml-2">Edit</span>
        </HeaderButton>

        <HeaderButton
          tag="a"
          download="{book.title}.epub"
          href="{book.id}/download"
        >
          <Icon name="download" />
          <span class="ml-2">Download</span>
        </HeaderButton>
      </nav>
      <!-- endregion -->

      <!-- region Book Title -->
      <div class="flex items-start justify-between md:flex-wrap">
        <div class="flex flex-col">
          <h1 class="text-4xl font-serif font-bold" data-animatable="title">{book.title}</h1>
          {#await creators}
            <span class="text-lg text-gray-600 dark:text-gray-300">Loading...</span>
          {:then creators}
            {@const essentialCreators = creators.filter(creator => creator.essential)}

            <span class="mt-2 text-xl text-gray-600 dark:text-gray-300" data-animatable="creators">
              by
              {#each essentialCreators as creator, index}
                <a href="/creators/{creator.id}" class="hover:underline">{creator.name}</a>
                <span>{index < essentialCreators.length - 1 ? ' & ' : ''}</span>
              {/each}
            </span>
          {/await}
          <RatingWidget {book} {ratings} class="-ml-3" data-animatable="ratings" />
        </div>
      </div>
      <!-- endregion -->
    </ContentSection>
  </header>

  <ContentSection class="pb-8 z-0">
    <div class="min-h-fit">
      {#if book.synopsis}
        <section>
          <header class="mb-2">
            <h3 class="text-xl font-bold">Synopsis</h3>
          </header>
          <MarkdownContent source={book.synopsis} />
        </section>
      {/if}
    </div>

    <div class="grid gap-2 grid-cols-2 mt-8">
      <ReviewWidget {reviews} />
      <RatingsWidget {ratings} />
    </div>

    {#if book.legal_information}
      <section class="text-gray-500 dark:text-gray-600 text-xs mt-8">
        <header class="mb-1">
          <h3 class="font-semibold">Legal Information</h3>
        </header>
        <MarkdownContent class="text-xs leading-snug" source={book.legal_information} />
      </section>
    {/if}

    <footer
      class="sticky bottom-10 py-8 mt-12 bg-white dark:bg-gray-950 shadow-white dark:shadow-gray-950
      shadow-[0_-8px_24px_16px_transparent]"
    >
      <Meta {book} {publisher} />
    </footer>
  </ContentSection>

  <CommentsPanel {comments} bind:this={commentsPanel} />
</article>

<CollectionModal {book} bind:open={collectionModalOpen} />

<style lang="postcss">
    article :global([data-animatable]) {
        /*noinspection CssInvalidFunction*/
        animation-timeline: scroll();
        animation-fill-mode: both;
        animation-timing-function: linear;
        animation-range: 0% 12rem;
    }

    article :global([data-animatable="blur"]) {
        animation-name: squeeze-blur;
    }

    article :global([data-animatable="cover"]) {
        animation-name: squeeze-cover;
        transform-origin: top center;
    }

    article :global([data-animatable="header"]) {
        animation-name: squeeze-header;
    }

    article :global([data-animatable="header-links"]) {
        animation-name: squeeze-header-links;
    }

    article :global([data-animatable="title"]) {
        animation-name: squeeze-title;
        display: block;
        transform-origin: top left;
    }

    article :global([data-animatable="creators"]) {
        animation-name: squeeze-creators;
    }

    article :global([data-animatable="ratings"]) {
        animation-name: squeeze-ratings;
    }

    @keyframes squeeze-blur {
        0% {
            transform: translateY(0);
        }

        100% {
            transform: translateY(-12rem);
        }
    }

    @keyframes squeeze-cover {
        0% {
            opacity: 1;
            transform: scale(1) translateY(0);
        }

        60%, 100% {
            opacity: 0;
        }

        100% {
            transform: scale(0.75) translateY(-8rem);
        }
    }

    @keyframes squeeze-header {
        0%, 40% {
            transform: translateY(0);
        }

        100% {
            transform: translateY(-1.5rem);
        }
    }

    @keyframes squeeze-header-links {
        0% {
            opacity: 1;
        }

        40%, 100% {
            opacity: 0;
        }
    }

    @keyframes squeeze-title {
        0% {
            transform: scale(1);
        }

        40%, 100% {
            transform: scale(0.8);
        }
    }

    @keyframes squeeze-header {
        0%,
        40% {
            transform: translateY(0);
        }

        100% {
            transform: translateY(-1.5rem);
        }
    }

    @keyframes squeeze-creators {
        0% {
            transform: translateY(0);
        }

        60%, 100% {
            transform: translateY(-0.5rem);
        }
    }

    @keyframes squeeze-ratings {
        0% {
            opacity: 1;
        }

        60%, 100% {
            opacity: 0;
            visibility: hidden;
        }
    }
</style>
