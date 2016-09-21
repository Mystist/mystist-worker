var redisClientConfig = undefined;
if (process.env.NODE_ENV === 'production') {
  redisClientConfig = 'redis://:' + process.env.REDIS_PASSWORD + '@' + process.env.OPENSHIFT_REDIS_HOST + ':' + process.env.OPENSHIFT_REDIS_PORT + '/0';
}

module.exports = redisClientConfig;
