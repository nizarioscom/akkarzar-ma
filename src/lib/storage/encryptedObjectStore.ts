import { createHash } from "node:crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { encryptBuffer, type Aes256GcmPayload } from "@/lib/crypto/aes256";

export type EncryptedUploadResult = {
  storageKey: string;
  sha256Ciphertext: string;
  encryptionIv: Buffer;
  encryptionAuthTag: Buffer;
  byteSize: number;
};

function getS3Client(): S3Client {
  const region = process.env.S3_REGION ?? "gra";
  const endpoint = process.env.S3_ENDPOINT;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

  if (!accessKeyId || !secretAccessKey) {
    throw new Error("S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY are required");
  }

  return new S3Client({
    region,
    endpoint,
    forcePathStyle: Boolean(endpoint),
    credentials: { accessKeyId, secretAccessKey },
  });
}

export function encryptObjectBuffer(plaintext: Buffer): Aes256GcmPayload {
  return encryptBuffer(plaintext);
}

export async function uploadEncryptedObject(input: {
  storageKey: string;
  plaintext: Buffer;
  contentType?: string;
}): Promise<EncryptedUploadResult> {
  const encrypted = encryptObjectBuffer(input.plaintext);
  const sha256Ciphertext = createHash("sha256").update(encrypted.ciphertext).digest("hex");
  const bucket = process.env.S3_BUCKET;

  if (!bucket) {
    throw new Error("S3_BUCKET is not set");
  }

  const client = getS3Client();
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: input.storageKey,
      Body: encrypted.ciphertext,
      ContentType: "application/octet-stream",
      Metadata: {
        "x-aqar-alg": "AES-256-GCM",
        "x-aqar-plain-type": input.contentType ?? "application/octet-stream",
      },
    }),
  );

  return {
    storageKey: input.storageKey,
    sha256Ciphertext,
    encryptionIv: encrypted.iv,
    encryptionAuthTag: encrypted.authTag,
    byteSize: encrypted.ciphertext.length,
  };
}
