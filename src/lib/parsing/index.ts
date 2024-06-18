import { isPdfFile } from '$lib/parsing/pdf';
import { isMobiFile } from '$lib/parsing/mobi';
import { isZipFile } from '$lib/parsing/epub';

export async function detectType(file: File) {
  if (await isPdfFile(file)) {
    return 'pdf';
  }

  if (await isMobiFile(file)) {
    return 'mobi';
  }

  if (await isZipFile(file)) {
    return 'epub';
  }

  throw new Error('Unsupported file format');
}
