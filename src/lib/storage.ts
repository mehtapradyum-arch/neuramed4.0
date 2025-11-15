import { put } from "@vercel/blob";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export async function storeImage(path: string, bytes: Uint8Array, contentType = "image/jpeg") {
  const provider = process.env.STORAGE_PROVIDER;
  if (provider === "blob") {
    const { url } = await put(path, bytes, { access: "public", contentType, token: process.env.VERCEL_BLOB_READ_WRITE_TOKEN });
    return url;
  }
  if (provider === "s3") {
    const s3 = new S3Client({
      endpoint: process.env.S3_ENDPOINT,
      region: "auto",
      credentials: { accessKeyId: process.env.S3_ACCESS_KEY_ID!, secretAccessKey: process.env.S3_SECRET_ACCESS_KEY! },
      forcePathStyle: true,
    });
    await s3.send(new PutObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: path, Body: bytes, ContentType: contentType, ACL: "public-read" }));
    return `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/${path}`;
  }
  throw new Error("Unknown storage provider");
}
