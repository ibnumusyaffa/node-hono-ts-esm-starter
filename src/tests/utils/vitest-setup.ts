import { expect } from "vitest"
import { db } from "@/lib/db/index.js"


expect.extend({
  async toHaveRowInTable(data: Record<string, any>, tableName: string) {
    try {
      // Build the WHERE conditions dynamically
      let query = db
        .selectFrom(tableName as any)
        .select(({ fn }) => fn.countAll().as("count"))

      // Add WHERE conditions for each key-value pair
      for (const [key, value] of Object.entries(data)) {
        query = query.where(key, "=", value)
      }

      const result = await query.executeTakeFirst()
      const hasRow = Number(result?.count) > 0

      return {
        message: () =>
          `expected table ${tableName} ${this.isNot ? "not " : ""}to have row matching ${JSON.stringify(
            data
          )}`,
        pass: hasRow,
      }
    } catch (error: any) {
      return {
        message: () => error?.message ?? "",
        pass: false,
      }
    }
  },
})
