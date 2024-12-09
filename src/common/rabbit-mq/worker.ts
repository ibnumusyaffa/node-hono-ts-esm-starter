/* eslint-disable unicorn/no-process-exit */
import amqp from "amqplib"
import { logger } from "@/common/logger.js"
import { getConnection } from "./connection.js"

type WorkerConfig<T> = {
  exchangeName: string
  queueName: string
  handler: (data: T) => Promise<void>
}

export class Worker<T> {
  private config: WorkerConfig<T>

  constructor(config: WorkerConfig<T>) {
    this.config = config
  }

  async start(): Promise<void> {
    try {
      const connection = await getConnection()
      const channel = await connection.createChannel()
      await channel.assertExchange(this.config.exchangeName, "fanout", {
        durable: true,
      })
      await channel.assertQueue(this.config.queueName, { durable: true })
      await channel.bindQueue(
        this.config.queueName,
        this.config.exchangeName,
        ""
      )
      await this.consumeMessages(channel)
      logger.info(`${this.config.queueName} worker started`)
    } catch (error) {
      logger.error(`Failed to start ${this.config.queueName} worker`, error)
    }
  }

  private async consumeMessages(channel: amqp.Channel): Promise<void> {
    channel.consume(
      this.config.queueName,
      (msg: any) => {
        if (msg === null) return
        const data = JSON.parse(msg.content.toString()) as T
        this.config
          .handler(data)
          .then(() => channel.ack(msg))
          .catch((error) => {
            logger.error(
              `Error processing message for ${this.config.queueName}`,
              error
            )
          })
      },
      { noAck: false }
    )
  }
}
