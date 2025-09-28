import { Hono } from "hono"
import { storage, getContentType } from "@/lib/storage.js"
import { randomUUID } from "node:crypto"

const router = new Hono()
// Local storage upload
router.post("/", async (c) => {
  const body = await c.req.parseBody()
  const file = body["file"] as File

  if (!file) {
    return c.json({ error: "No file provided" }, 422)
  }

  const fileName = `${randomUUID()}_${file.name}`
  await storage.write(fileName, file.stream())

  return c.json({
    success: true,
    fileName,
    size: file.size,
    type: file.type,
  })
})

router.get("/:filename", async (c) => {
  const filename = c.req.param("filename")

  // Check if file exists
  const exists = await storage.fileExists(filename)
  if (!exists) {
    return c.json({ error: "File not found" }, 404)
  }

  // Get file info
  const stat = await storage.statFile(filename)
  // Stream the file
  const stream = await storage.read(filename)

  // Return the stream
  return new Response(stream, {
    headers: {
      "Content-Type": getContentType(filename),
      "Content-Length": String(stat.size ?? 0),
    },
  })
})

export default router
