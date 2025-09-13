#!/usr/bin/env node
// cli.js
import { Command } from "commander"
import * as productService from "@/app/product/product-service.js"
import { db } from "@/lib/db/index.js"

const program = new Command()

program
  .name("app-cli")
  .description("CLI for worker and utility commands")
  .version("1.0.0")

program
  .command("time")
  .description("Show the current time")
  .action(() => {
    const currentTime = new Date().toLocaleString()
    console.log(`Current time: ${currentTime}`)
  })


program.command("user:list")
  .description("List all users")
  .action(async () => {
    try {
      await productService.list()
    } finally {
      // Close database connections to allow graceful exit
      await db.destroy()
    }
  })

program.parse(process.argv)
