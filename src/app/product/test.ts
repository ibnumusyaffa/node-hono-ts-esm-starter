import { welcomeEmailJob } from "./product-job.js"


welcomeEmailJob.send({ message: "Product 1" })

welcomeEmailJob.worker()
