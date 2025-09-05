import { task, wait, logger } from "@trigger.dev/sdk/v3"

export const firstScheduledTask = task({
  id: "first-scheduled-task",
  // Every hour
  // Set an optional maxDuration to prevent tasks from running indefinitely
  maxDuration: 300, // Stop executing after 300 secs (5 mins) of compute
  run: async ({ seconds }: { seconds: number }) => {
    // Wait for 5 seconds
    await wait.for({ seconds })

    logger.log("finished")
  },
})
