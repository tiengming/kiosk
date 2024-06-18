import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { S3_ACCESS_KEY_ID, S3_ENDPOINT, S3_REGION, S3_SECRET_ACCESS_KEY } from '$env/static/private';

export const client = new S3Client({
  region: S3_REGION,
  endpoint: S3_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: S3_ACCESS_KEY_ID,
    secretAccessKey: S3_SECRET_ACCESS_KEY
  }
});

export function downloadObject(bucket: string, filename: string) {
  return client.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: filename
    })
  );
}

export async function readFile(
  platform: Readonly<App.Platform> | undefined,
  bucket: string,
  filename: string
) {
  try {
    const response = await downloadObject(bucket, filename);

    return response.Body?.transformToByteArray() ?? new Uint8Array();
  } catch (cause) {
    console.error({cause})
    throw new Error(`Failed to read file ${filename}`, { cause });
  }
}


export async function streamFile(
  platform: Readonly<App.Platform> | undefined,
  bucket: string,
  filename: string
) {
  try {
    const response = await downloadObject(bucket, filename);

    return response.Body?.transformToWebStream() ?? new ReadableStream();
  } catch (cause) {
    console.error({cause})
    throw new Error(`Failed to read file ${filename}`, { cause });
  }
}
