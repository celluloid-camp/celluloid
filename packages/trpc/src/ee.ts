import { env, RedisEventEmitter } from "@celluloid/utils"
// Assuming you have a valid Redis URL

export const ee = new RedisEventEmitter(env.REDIS_URL);

// Subscribe, listen, and publish as before
// ee.subscribe('myChannel');
// ee.on('myChannel', (message: string) => {
//     console.log(`Received message: ${message}`);
// });
// ee.publish('myChannel', 'Hello, World!');
