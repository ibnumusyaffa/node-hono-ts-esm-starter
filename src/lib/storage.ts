import path from "node:path"
import mime from "mime-types"
import { FileStorage } from "@flystorage/file-storage"

import { LocalStorageAdapter } from "@flystorage/local-fs"
import { AwsS3StorageAdapter } from "@flystorage/aws-s3"
import { S3Client } from "@aws-sdk/client-s3"

// Initialize S3 adapter
const S3client = new S3Client()
const S3adapter = new AwsS3StorageAdapter(S3client, {
  bucket: "bucket-name",
  prefix: "{optional-path-prefix}",
})

// Initialize local adapter
const localAdapter = new LocalStorageAdapter(
  path.resolve(process.cwd(), "storage/app")
)

// Initialize storage
export const storage = new FileStorage(localAdapter)


export function getContentType(filename: string) {
  return mime.lookup(filename) || "application/octet-stream"
}
