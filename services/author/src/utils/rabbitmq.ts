import amqp from "amqplib";

let channel: amqp.Channel;

export const connectRabbitMQ = async () => {
  try {
    // const connection = await amqp.connect({
    //   // protocol: "amqp",
    //   // hostname: "localhost", // or 'rabbitmq-container' if inside Docker
    //   // port: 5672,
    //   // username: "admin",
    //   // password: "admin123",
    // });
    const connection = await amqp.connect("amqp://localhost")
    // channel = await connection.createChannel();
    // console.log("✅ Connected to RabbitMQ");
    // const connection = await amqp.connect({
    //   protocol: "amqp",
    //   hostname: "localhost",
    //   port: 5672,
    //   username: "admin",
    //   password: "admin123",
    // });

    channel = await connection.createChannel();

    console.log("✅ Connected to Rabbitmq");

    // console.log("Message sent.");
  } catch (error) {
    console.error("❌ Failed to connect to RabbitMQ", error);
  }
};


export const publishToQueue = async (queueName: string, message: any) => {
  if (!channel) {
    console.error("Rabbitmq channel is not intialized");
    return;
  }
  console.log(queueName,'queueName')
  await channel.assertQueue(queueName, { durable: true });

  channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
    persistent: true,
  });
};

export const invalidateChacheJob = async (cacheKeys: string[]) => {
  try {
    const message = {
      action: "invalidateCache",
      keys: cacheKeys,
    };
    console.log('cacheKeys',cacheKeys)
    await publishToQueue("cache-invalidation", message);

    console.log("✅ Cache invalidation job published to Rabbitmq");
  } catch (error) {
    console.error("❌ Failed to Publish cache on Rabbitmq", error);
  }
};