import path from "node:path"
import mime from "mime-types"
import env from "@/config/env.js"
import { FileStorage } from "@flystorage/file-storage"

import { LocalStorageAdapter } from "@flystorage/local-fs"
import { AwsS3StorageAdapter } from "@flystorage/aws-s3"
import { S3Client } from "@aws-sdk/client-s3"

const S3client = new S3Client({
  region: env.AWS_DEFAULT_REGION,
  endpoint: env.AWS_ENDPOINT,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
})
const S3adapter = new AwsS3StorageAdapter(S3client, {
  bucket: env.AWS_BUCKET,
})

// Initialize local adapter
const localAdapter = new LocalStorageAdapter(
  path.resolve(process.cwd(), "storage/app")
)

const conf = {
  local: localAdapter,
  s3: S3adapter,
}

// Initialize storage
export const storage = new FileStorage(conf[env.FILE_STORAGE])

export function getContentType(filename: string) {
  return mime.lookup(filename) || "application/octet-stream"
}
