#!/usr/bin/env node
// cli.js
import { Command } from "commander"
import * as auth from "@/app/auth/auth-worker.js"

const program = new Command()

program
  .name("app-cli")
  .description("CLI for worker and utility commands")
  .version("1.0.0")

program
  .command("forgot-password-worker")
  .description("Start the forgot password worker")
  .action(async () => auth.forgotPasswordWorker.start())

program
  .command("time")
  .description("Show the current time")
  .action(() => {
    const currentTime = new Date().toLocaleString()
    console.log(`Current time: ${currentTime}`)
  })

program.parse(process.argv)
