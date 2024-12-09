/* eslint-disable unicorn/no-process-exit */
import amqp from "amqplib"
import { getConnection } from "./connection.js"

export class Publisher {
  private channel: amqp.Channel | undefined = undefined
  private assertedExchanges: Map<string, string> = new Map()

  private async getChannel(): Promise<amqp.Channel> {
    if (this.channel) {
      return this.channel
    }
    const conn = await getConnection()
    this.channel = await conn.createChannel()
    return this.channel
  }

  private async assertExchange(
    exchange: string,
    type: string = "fanout"
  ): Promise<void> {
    const existingType = this.assertedExchanges.get(exchange)
    if (existingType === type) {
      return // Exchange already asserted with the same type
    }
    const channel = await this.getChannel()
    await channel.assertExchange(exchange, type, { durable: true })
    this.assertedExchanges.set(exchange, type)
  }

  public async publish<T>(
    exchange: string,
    message: T,
    type: string = "fanout"
  ): Promise<void> {
    await this.assertExchange(exchange, type)
    const channel = await this.getChannel()
    try {
      channel.publish(exchange, "", Buffer.from(JSON.stringify(message)), {
        persistent: true,
      })
      console.log(`Message sent to exchange ${exchange}: ${message}`)
    } catch (error) {
      console.error("Failed to publish message:", error)
      throw error
    }
  }

  public async close(): Promise<void> {
    if (this.channel) {
      await this.channel.close()
      this.channel = undefined
    }
    this.assertedExchanges.clear()
  }
}

