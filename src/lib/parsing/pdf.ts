import { getDocument } from 'pdfjs-dist';

export async function isPdfFile(file: File) {
  const slices = new Uint8Array(await file.slice(0, 5).arrayBuffer());

  return (
    slices[0] === 0x25 &&
    slices[1] === 0x50 &&
    slices[2] === 0x44 &&
    slices[3] === 0x46 &&
    slices[4] === 0x2d
  );
}

export async function getMetadata(file: File) {
  const document = await load(file);

  return await document.getMetadata();
}

async function load(file: File) {
  const buffer = await file.arrayBuffer();

  return getDocument(buffer).promise;
}
