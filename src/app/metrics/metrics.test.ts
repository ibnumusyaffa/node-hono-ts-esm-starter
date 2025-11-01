import { describe, expect, it, vi, afterEach } from "vitest"

import app from "@/app.js"

import {
  exampleActiveRequests,
  exampleItemsProcessedHistogram,
  exampleRequestCounter,
  exampleRequestDurationHistogram,
} from "@/lib/metrics.js"

describe("metrics example API", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("records example metrics and responds with contextual data", async () => {
    const counterSpy = vi.spyOn(exampleRequestCounter, "add")
    const durationSpy = vi.spyOn(exampleRequestDurationHistogram, "record")
    const itemsSpy = vi.spyOn(exampleItemsProcessedHistogram, "record")
    const activeSpy = vi.spyOn(exampleActiveRequests, "add")

    const response = await app.request("/metrics/example?flavor=strawberry")

    expect(response.status).toBe(200)
    const body = await response.json()

    expect(body).toMatchObject({
      message: "Recorded OpenTelemetry example metrics.",
      flavor: "strawberry",
    })
    expect(typeof body.processedItems).toBe("number")
    expect(typeof body.durationMs).toBe("number")

    expect(counterSpy).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ flavor: "strawberry" })
    )
    expect(itemsSpy).toHaveBeenCalledWith(
      expect.any(Number),
      expect.objectContaining({ flavor: "strawberry" })
    )
    expect(durationSpy).toHaveBeenCalledWith(
      expect.any(Number),
      expect.objectContaining({ flavor: "strawberry" })
    )
    expect(activeSpy).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ flavor: "strawberry" })
    )
    expect(activeSpy).toHaveBeenLastCalledWith(
      -1,
      expect.objectContaining({ flavor: "strawberry" })
    )
  })
})
