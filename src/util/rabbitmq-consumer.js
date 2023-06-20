const amqp = require("amqplib");
const { UserService } = require("../service/user-service");
const rabbitMQConfig = require("config").get("rabbitmq");

const service = new UserService();

async function consumePayments() {
  const connection = await amqp.connect(rabbitMQConfig.url);
  const channel = await connection.createChannel();
  
  await channel.assertExchange("schoolExchange", "direct");
  
  const q = await channel.assertQueue("HostelPaymentQueue");
  
  await channel.bindQueue(q.queue, "schoolExchange", "hostel");
  
  channel.consume(q.queue, async (msg) => {
    const data = JSON.parse(msg.content);
    console.log("Recieved Payment");
    try {
      await service.CreateUser(data.payment);
      channel.ack(msg);
      
    } catch (error) {
      console.error(error.message);
      console.error("Couldn't sync payment");
    }
    // await Error.create({logType: data.logType, message: data.message});
  });
}

module.exports = {consumePayments};