import path from "node:path"
import mime from "mime-types"
import env from "@/config/env.js"
import { FileStorage } from "@flystorage/file-storage"

import { LocalStorageAdapter } from "@flystorage/local-fs"
import { AwsS3StorageAdapter } from "@flystorage/aws-s3"
import { S3Client } from "@aws-sdk/client-s3"

function createAdapter() {
  if (env.FILE_STORAGE === "s3") {
    if (!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY || !env.AWS_BUCKET || !env.AWS_ENDPOINT) {
      throw new Error("S3 credentials must be set")
    }
    const client = new S3Client({
      region: env.AWS_DEFAULT_REGION,
      endpoint: env.AWS_ENDPOINT,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
    })
    return new AwsS3StorageAdapter(client, {
      bucket: env.AWS_BUCKET,
    })
  }


  return new LocalStorageAdapter(
    path.resolve(process.cwd(), "storage/app")
  )
}


export const storage = new FileStorage(createAdapter())

export function getContentType(filename: string) {
  return mime.lookup(filename) || "application/octet-stream"
}
