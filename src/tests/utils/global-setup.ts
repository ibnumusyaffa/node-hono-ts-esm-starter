import { migrate, truncateAllTables } from "@/common/database/index.js"
import { type StartedTestContainer } from "testcontainers"
import { rabbitMQ, mysql } from "@/tests/utils/container.js"
import env from "@/config/env.js"

let containers: StartedTestContainer[] = []

export async function setup() {
  const startTime = performance.now()

  if (env.TEST_CONTAINER) {
    containers = await Promise.all([rabbitMQ(), mysql()])
  }

  await migrate()

  const timeTaken = performance.now() - startTime
  console.info(`setup took ${timeTaken.toFixed(0)} ms.`)
}

export async function teardown() {
  await truncateAllTables()
  const isCI = false
  if (isCI) {
    for (const item of containers) {
      item.stop()
    }
  }

  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(0)
}
