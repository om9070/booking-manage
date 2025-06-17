const redis = require('redis');

const client = redis.createClient({
  url: process.env.REDIS_URL||'redis://redis:6379'

});

client.on('error', (err) => console.error('Redis Client Error', err));

(async () => {
  await client.connect();
  console.log("redis is connected")
})();

module.exports = client;
