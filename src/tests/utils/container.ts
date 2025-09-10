import { GenericContainer, Wait } from "testcontainers"

export async function rabbitMQ() {
  return new GenericContainer("rabbitmq:3-management")
    .withEnvironment({
      RABBITMQ_DEFAULT_USER: "guest",
      RABBITMQ_DEFAULT_PASS: "guest",
    })
    .withExposedPorts(
      {
        container: 5672,
        host: 5672,
      },
      {
        container: 15_672,
        host: 15_672,
      }
    )
    .withReuse()
    .start()
}

export async function mysql() {
  return new GenericContainer("mysql:8.0-debian")
    .withEnvironment({
      MYSQL_ROOT_PASSWORD: "password",
      MYSQL_DATABASE: "starterdb",
      MYSQL_USER: "user",
      MYSQL_PASSWORD: "password",
    })
    .withExposedPorts({
      container: 3306,
      host: 3309,
    })
    .withWaitStrategy(Wait.forLogMessage(/.*ready for connections.*/))
    .withReuse()
    .start()
}
