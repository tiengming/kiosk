import type { WorkerMessage } from '$lib/workers/workers';
import { sleep } from '$lib/utilities';
import { log } from '$lib/logging';
import { detectType } from '$lib/parsing';
import { getMetadata } from '$lib/parsing/pdf';

const pending = new Map<string, AbortController>();
let root: FileSystemDirectoryHandle | null = null;

// declare const self: WorkerGlobalScope;

self.addEventListener('unhandledrejection', ({ reason }) => {
  throw reason;
});

self.addEventListener('message', handleMessage);

async function handleMessage(
  { data: { type, payload } }: MessageEvent<UploadRequest | ResumeRequest | CancelUploadRequest>,
) {
  console.log('Handling messsage', { type, payload });
  switch (type) {
    case 'cancel':
      return payload.id
        ? await handleCancelUpload({ id: payload.id })
        : await handleCancelAllUploads(payload);

    case 'upload':
      console.log('upload worker', { payload });
      return await handleUpload(payload);

    case 'resume':
      return handleResumption(payload);
  }
}

async function handleUpload({ files }: UploadPayload) {
  log('worker:upload', 'info', `Uploading ${files.length} books`);

  const uploadsDirectory = await getUploadsDirectory();

  // Ensure we have abort controller instances for all files, so we can handle intermediate aborts
  files.forEach(({ id }) => pending.set(id, new AbortController()));

  // Copy the file streams into the OPFS. If the operation is aborted mid-flight, we'll cancel the
  // stream copy, which should yield a clean state.
  const operations = files.map(async ({ id, name, buffer }) => {
    const { signal } = pending.get(id)!;
    signal.throwIfAborted();

    const container = await uploadsDirectory.getDirectoryHandle(id, { create: true });
    const handle = await container.getFileHandle(name, { create: true });
    const writable = await handle.createWritable({ keepExistingData: false });

    signal.addEventListener('abort', async (cause) => {
      await writable.abort(cause);

      return self.postMessage({
        type: 'upload',
        payload: {
          error: 'Upload Cancelled',
          failed: true,
          id,
        },
      } satisfies UploadResponse);
    });

    await writable.write(buffer);
    await writable.close();

    // TODO: Do something with this book!

    const result = await processFile(id, await handle.getFile());
    await uploadsDirectory.removeEntry(id, { recursive: true });

    self.postMessage({
      type: 'upload',
      payload: { failed: false, result, id },
    } satisfies UploadResponse);

    return handle;
  });

  try {
    const files = await Promise.all(operations);

    console.log('Got local copies of all files!', { files });
  } catch (cause) {
    throw new Error(`Failed to upload files: ${(cause as Error).message}`, { cause });
  }
}

async function handleResumption({ ids }: ResumePayload) {
  log('worker:upload', 'info', `Resuming pending upload of ${ids.length} books`, { ids });

  const directory = await getUploadsDirectory();
  const resumable = await resolveResumableFiles(directory, ids);
  const results = await Promise.all(
    resumable.map(async ({ id, file }) => [id, await processFile(id, file)] as const),
  );
  await Promise.all(resumable.map(({ id }) => directory.removeEntry(id, { recursive: true })));

  results.forEach(([id, result]) =>
    self.postMessage({
      type: 'upload',
      payload: {
        failed: false,
        result,
        id,
      },
    } satisfies UploadResponse),
  );
}

async function handleCancelUpload({ id }: Required<CancelPayload>) {
  log('worker:upload', 'warning', `Cancelling upload for #${id}`);
  const upload = pending.get(id);

  if (!upload) {
    return;
  }

  upload.abort('cancelled');
  self.postMessage({
    id,
    failed: true,
    error: 'Upload Cancelled',
  } satisfies UploadResponsePayload);
}

async function handleCancelAllUploads(_payload: CancelPayload) {
  log('worker:upload', 'warning', 'Cancelling all pending uploads');

  for (const [id, controller] of pending.entries()) {
    controller.abort('cancelled');

    self.postMessage({
      id,
      failed: true,
      error: 'Upload Cancelled',
    } satisfies UploadResponsePayload);
  }
}

async function processFile(id: string, file: File) {
  log('worker:upload', 'info', `Processing uploaded file`, { id, file });

  await sleep(5_000);

  // TODO: Detect book file type
  const type = await detectType(file);

  // TODO: Parse book
  switch (type) {
    case 'pdf':
      console.log(await getMetadata(file));
      break;

    case 'mobi':
      break;

    case 'epub':
      break;
  }

  // TODO: Extract metadata
  // TODO: Upload asset

  return {
    id,
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
  };
}

async function getFilesystemRoot() {
  if (root === null) {
    root = await navigator.storage.getDirectory();
  }

  return root;
}

async function getUploadsDirectory() {
  const root = await getFilesystemRoot();

  return root.getDirectoryHandle('uploads', { create: true });
}

async function resolveResumableFiles(directory: FileSystemDirectoryHandle, ids: string[]) {
  const fragments = await Promise.all(
    ids.map(async (id) => {
      const container = await directory.getDirectoryHandle(id, { create: false });
      let file: File | undefined = undefined;

      for await (const entry of container.values()) {
        if (entry.kind === 'file') {
          file = await entry.getFile();
          break;
        }
      }

      return { id, file };
    }),
  );

  type Resumable = {
    id: string;
    file: File;
  };

  return fragments.filter(
    (fragment): fragment is Resumable => typeof fragment.file !== 'undefined',
  );
}

type UploadPayload = {
  files: { id: string; name: string; buffer: ArrayBuffer }[];
};
export type UploadRequest = WorkerMessage<'upload', UploadPayload>;

type ResumePayload = {
  ids: string[];
};
export type ResumeRequest = WorkerMessage<'resume', ResumePayload>;

type CancelPayload = {
  id?: string;
};
export type CancelUploadRequest = WorkerMessage<'cancel', CancelPayload>;

type UploadResponsePayload =
  | {
      id: string;
      failed: true;
      error: string;
    }
  | {
      id: string;
      failed: false;
      result: Record<string, unknown>;
    };
export type UploadResponse = WorkerMessage<'upload', UploadResponsePayload>;
