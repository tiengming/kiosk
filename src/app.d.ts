// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
import type { Client } from '$lib/server/database';
import type { CompositionEventHandler } from 'svelte/elements';

declare global {
  namespace App {
    interface Error {
      title?: string;
      code?: string;
      message?: string;
    }

    interface Locals {
      database: Client;
    }

    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }

  declare namespace svelteHTML {
    interface HTMLAttributes<T> {
      'on:clickOutside'?: CompositionEventHandler<T>;
    }
  }
}

export {};
