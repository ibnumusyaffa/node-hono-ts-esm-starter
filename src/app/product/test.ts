import * as productJob from "./product-job.js"


productJob.send({ message: "Product 1" })

productJob.worker()