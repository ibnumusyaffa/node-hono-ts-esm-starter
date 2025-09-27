#!/usr/bin/env node
// cli.js
// Import OpenTelemetry configuration first
import "./otel.js"
import { Command } from "commander"
import { welcomeEmailJob } from "./app/product/product-job.js"
import { boss } from "./lib/job.js"

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

program
  .command("worker:welcome-email")
  .description("Start the welcome email worker")
  .action(async () => {
    await boss.start()
    await welcomeEmailJob.worker()
  })

program.parse(process.argv)
