export async function isZipFile(file: File) {
  const slices = new Uint8Array(await file.slice(0, 4).arrayBuffer());

  return (
    slices[0] === 0x50 &&
    slices[1] === 0x4b &&
    slices[2] === 0x03 &&
    slices[3] === 0x04
  );
}
