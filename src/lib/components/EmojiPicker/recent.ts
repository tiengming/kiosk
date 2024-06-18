import { derived, writable } from 'svelte/store';
import { browser } from '$app/environment';

const key = 'kiosk.emoji.recent';
const initialValue = browser ? deserialize(localStorage.getItem(key) || '') : [];

// Recently used emojis are stored in local storage, on-device. The store transparently encodes the
// array of strings into a single string, using a null byte as the separator character.

const store = writable(initialValue);
export const recent = derived(store, (s) => s);

export function addRecentlyUsedEmoji(emoji: string) {
  store.update((values) => Array.from(new Set([emoji, ...values])).slice(0, 20));
}

if (browser) {
  store.subscribe((value) => localStorage.setItem(key, serialize(value)));

  // By listening to the storage event, we can keep the store in sync with other tabs. This way,
  // the recent emojis are shared in real-time across all open tabs.
  window.addEventListener('storage', (event) => {
    if (event.key === key) {
      store.set(deserialize(event.newValue || ''));
    }
  });
}

function serialize(value: string[]) {
  return value.join('\0');
}

function deserialize(value: string) {
  return value.split('\0');
}
