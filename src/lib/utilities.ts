import type { Action } from 'svelte/action';
import { decode, encode } from 'blurhash';

export function generateRandomString(length: number, alphabet?: string) {
  // noinspection SpellCheckingInspection
  const characters = alphabet ??
    'ABCDEFGHIJKLMNOPQRSTUVWXYZqeytrpolkadjsghfgmnbzxcvnQPOWEYRKASJHDGFMNBCV' +
    'Xjsfhrlg124903564576986483658fgh4sdfh687e4h897WETHJ68F7G468847' +
    '1877GFHJFFGJ87469857468746hfghwrtiyj4598yhdjkhgnk';

  return Array(length)
    .fill(undefined)
    .reduce<string>(
      (carry, _) => carry + characters.charAt(Math.floor(Math.random() * characters.length)),
      '',
    );
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function uniqueBy<T, P extends keyof T = keyof T, V = unknown>(
  array: T[],
  property: P | ((item: T) => V),
) {
  const seen = new Set();
  const predicate = (item: T) => (typeof property === 'function' ? property(item) : item[property]);

  return array.filter((item) => {
    const value = predicate(item);

    return seen.has(value) ? false : seen.add(value);
  });
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function createStreamFromArrayBuffer(buffer: ArrayBuffer, chunkSize = 64 * 1024) {
  return new ReadableStream({
    start(controller) {
      const bytes = new Uint8Array(buffer);
      for (let readIndex = 0; readIndex < bytes.byteLength; ) {
        controller.enqueue(bytes.subarray(readIndex, (readIndex += chunkSize)));
      }

      controller.close();
    },
  });
}

export async function createArrayBufferFromStream(stream: ReadableStream<Uint8Array>) {
  let result = new Uint8Array(0);
  const reader = stream.getReader();

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    const newResult = new Uint8Array(result.length + value.length);

    newResult.set(result);
    newResult.set(value, result.length);

    result = newResult;
  }

  return result.buffer;
}

export function arrayBufferToHex(buffer: ArrayBufferLike) {
  return Array.from(new Uint8Array(buffer)).reduce(
    (acc, byte) => acc + byte.toString(16).padStart(2, '0'),
    '',
  );
}

export function hexToArrayBuffer(hex: string) {
  const { buffer } = Uint8Array.from(hex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)));

  return buffer;
}

export function generateRandomBytes(amount: number) {
  return arrayBufferToHex(crypto.getRandomValues(new Uint8Array(amount)));
}

export function generateRandomUuid() {
  return crypto.randomUUID();
}

export async function getImageDimensions(image: string | ArrayBuffer) {
  if (typeof image === 'string') {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = image;

      img.addEventListener('error', (error) => reject(error));
      img.addEventListener('load', () =>
        resolve({
          width: img.width,
          height: img.height,
        }),
      );
    });
  }

  const { width, height } = await createImageBitmap(new Blob([image]), {});

  return { width, height };
}

/**
 * Encodes a blur hash for a given image.
 *
 * @param buffer
 * @param context
 * @see https://blurha.sh/
 */
export async function encodeImageToBlurHash(
  buffer: Blob | ArrayBuffer | HTMLImageElement,
  context: CanvasDrawImage & CanvasImageData,
) {
  buffer = buffer instanceof ArrayBuffer ? new Blob([buffer]) : buffer;
  const bitmap = await createImageBitmap(buffer, {});

  context.drawImage(bitmap, 0, 0);

  const { data, width, height } = context.getImageData(0, 0, bitmap.width, bitmap.height);

  return encode(data, width, height, 4, 3);
}

export async function decodeBlurHashToImage(hash: string, resolution: number = 32) {
  const pixels = decode(hash, 242, 415);
  const canvas = document.createElement('canvas');
  const { width, height } = canvas;
  const context = canvas.getContext('2d') as CanvasRenderingContext2D;
  const imageData = context.createImageData(width, height);

  imageData.data.set(pixels);
  context.putImageData(imageData, 0, 0);

  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob)));
}

export function humanReadableFileSize(size: number) {
  const i: number = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
  const unit: string = ['B', 'kB', 'MB', 'GB', 'TB'][i];

  return Number((size / Math.pow(1024, i)).toFixed(2)) + ' ' + unit;
}

export type TypedArray =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array
  | BigInt64Array
  | BigUint64Array;

export function encodeToBase64(
  input: ArrayBufferLike | TypedArray | Buffer | string,
  urlSafe: boolean = false,
  padding: boolean = true,
): string {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : new Uint8Array(input);
  const chunkSize = 0x8000;
  const values = [];

  for (let i = 0; i < bytes.length; i += chunkSize) {
    values.push(String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunkSize))));
  }

  let base64 = btoa(values.join(''));

  if (urlSafe) {
    base64 = base64ToBase64url(base64);
  }

  if (!padding) {
    base64 = removeBase64Padding(base64);
  }

  return base64;
}

export function decodeFromBase64(base64: string): Uint8Array;
export function decodeFromBase64(base64: string, stringOutput: undefined): Uint8Array;
export function decodeFromBase64(base64: string, stringOutput: false): Uint8Array;
export function decodeFromBase64(base64: string, stringOutput: true): string;
export function decodeFromBase64(base64: string, stringOutput: boolean): Uint8Array | string;
export function decodeFromBase64(
  base64: string,
  stringOutput: undefined | boolean = false,
): Uint8Array | string {
  let urlSafe = false;

  if (/^[0-9a-zA-Z_-]+={0,2}$/.test(base64)) {
    urlSafe = true;
  } else if (!/^[0-9a-zA-Z+/]*={0,2}$/.test(base64)) {
    throw new Error('Not a valid base64 input');
  }

  if (urlSafe) {
    base64 = base64urlToBase64(base64);
  }

  const bytes = new Uint8Array(
    atob(base64)
      .split('')
      .map((c) => c.charCodeAt(0)),
  );

  return stringOutput ? new TextDecoder().decode(bytes) : bytes;
}

function base64ToBase64url(value: string) {
  return value.replace(/\+/g, '-').replace(/\//g, '_');
}

function base64urlToBase64(value: string) {
  return value.replace(/-/g, '+').replace(/_/g, '/').replace(/=/g, '');
}

function removeBase64Padding(value: string) {
  return value.replace(/=/g, '');
}

/** Dispatch event on click outside of node */
export const clickOutside: Action = function clickOutside(node: HTMLElement) {
  const handleClick = (event: Event) => {
    if (node && !node.contains(event.target as HTMLElement) && !event.defaultPrevented) {
      node.dispatchEvent(
        new CustomEvent('clickOutside', {
          detail: { node },
        }),
      );
    }
  };

  document.addEventListener('click', handleClick, true);

  return {
    destroy() {
      document.removeEventListener('click', handleClick, true);
    },
  };
};

export const sticky: Action<HTMLElement, { stickToTop: boolean; top?: number }> = function sticky(
  node,
  { stickToTop, top = 0 }: { stickToTop: boolean; top?: number },
) {
  node.style.position = 'sticky';
  node.style.top = `${top}px`;

  const stickySentinelTop = document.createElement('div');
  stickySentinelTop.classList.add('__stickySentinelTop__');
  stickySentinelTop.style.position = 'absolute';
  stickySentinelTop.style.height = '1px';
  node.parentNode?.prepend(stickySentinelTop);

  const stickySentinelBottom = document.createElement('div');
  stickySentinelBottom.classList.add('__stickySentinelBottom__');
  stickySentinelBottom.style.position = 'absolute';
  stickySentinelBottom.style.height = '1px';
  node.parentNode?.append(stickySentinelBottom);

  const mutationObserver = new MutationObserver((mutations) =>
    mutations.forEach(() => {
      const { parentNode: topParent } = stickySentinelTop;
      const { parentNode: bottomParent } = stickySentinelBottom;

      if (stickySentinelTop !== topParent?.firstChild) {
        topParent?.prepend(stickySentinelTop);
      }

      if (stickySentinelBottom !== bottomParent?.lastChild) {
        bottomParent?.append(stickySentinelBottom);
      }
    }),
  );

  mutationObserver.observe(node.parentNode as HTMLElement, { childList: true });

  const intersectionObserver = new IntersectionObserver(([entry]) =>
    node.dispatchEvent(
      new CustomEvent('stuck', {
        detail: {
          isStuck: !entry.isIntersecting && isValidYPosition(entry),
        },
      }),
    ),
  );

  const isValidYPosition = ({ target, boundingClientRect }: IntersectionObserverEntry) =>
    target === stickySentinelTop ? boundingClientRect.y < 0 : boundingClientRect.y > 0;

  intersectionObserver.observe(stickToTop ? stickySentinelTop : stickySentinelBottom);

  return {
    update() {
      if (stickToTop) {
        intersectionObserver.unobserve(stickySentinelBottom);
        intersectionObserver.observe(stickySentinelTop);
      } else {
        intersectionObserver.unobserve(stickySentinelTop);
        intersectionObserver.observe(stickySentinelBottom);
      }
    },

    destroy() {
      intersectionObserver.disconnect();
      mutationObserver.disconnect();
    },
  };
};

export type ThenArg<TType> = TType extends PromiseLike<infer U> ? ThenArg<U> : TType;

export type AsyncReturnType<TFunction extends (...args: unknown[]) => unknown> = ThenArg<
  ReturnType<TFunction>
>;

export type MaybePromise<T> = T | Promise<T>;

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;
