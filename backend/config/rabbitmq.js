import amqp from 'amqplib';

const RABBITMQ_HOST = process.env.RABBITMQ_HOST || 'localhost';
const RABBITMQ_PORT = process.env.RABBITMQ_PORT || '5672';
const RABBITMQ_USERNAME = process.env.RABBITMQ_USERNAME || 'guest';
const RABBITMQ_PASSWORD = process.env.RABBITMQ_PASSWORD || 'guest';
const RABBITMQ_VHOST = process.env.RABBITMQ_VHOST || '/';
const RABBITMQ_EXCHANGE = process.env.RABBITMQ_EXCHANGE || 'solo_trips';
const RABBITMQ_QUEUE = process.env.RABBITMQ_QUEUE || 'solo_trips_queue';

const RABBITMQ_URL = `amqp://${RABBITMQ_USERNAME}:${RABBITMQ_PASSWORD}@${RABBITMQ_HOST}:${RABBITMQ_PORT}${RABBITMQ_VHOST}`;

let connection = null;
let channel = null;

async function connectQueue() {
    try {
        connection = await amqp.connect(RABBITMQ_URL);
        channel = await connection.createChannel();
        
        await channel.assertExchange(RABBITMQ_EXCHANGE, 'direct', { durable: true });
        await channel.assertQueue(RABBITMQ_QUEUE, { durable: true });
        
        console.log('RabbitMQ Connection established successfully');
        return { connection, channel };
    } catch (error) {
        console.error('Error connecting to RabbitMQ:', error);
        throw error;
    }
}

async function closeConnection() {
    try {
        if (channel) await channel.close();
        if (connection) await connection.close();
        console.log('RabbitMQ connection closed successfully');
    } catch (error) {
        console.error('Error closing RabbitMQ connection:', error);
        throw error;
    }
}

async function publishMessage(routingKey, message) {
    try {
        if (!channel) {
            await connectQueue();
        }
        await channel.publish(
            RABBITMQ_EXCHANGE,
            routingKey,
            Buffer.from(JSON.stringify(message)),
            { persistent: true }
        );
    } catch (error) {
        console.error('Error publishing message:', error);
        throw error;
    }
}

async function consumeMessages(routingKey, callback) {
    try {
        if (!channel) {
            await connectQueue();
        }
        await channel.bindQueue(RABBITMQ_QUEUE, RABBITMQ_EXCHANGE, routingKey);
        
        await channel.consume(RABBITMQ_QUEUE, async (data) => {
            try {
                const message = JSON.parse(data.content);
                await callback(message);
                channel.ack(data);
            } catch (error) {
                console.error('Error processing message:', error);
                channel.nack(data);
            }
        });
    } catch (error) {
        console.error('Error consuming messages:', error);
        throw error;
    }
}

const getConnection = () => connection;
const getChannel = () => channel;

export {
    connectQueue,
    closeConnection,
    publishMessage,
    consumeMessages,
    getConnection,
    getChannel
};
