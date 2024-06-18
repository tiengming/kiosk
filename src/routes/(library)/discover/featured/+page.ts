import type { PageLoad } from './$types';
import { getFeaturedBooks } from '$lib/shops/gutendex';

export const load = function load(_event) {
  const featured = {
    gutendex: getFeaturedBooks()
  };

  return { featured };
} satisfies PageLoad;
