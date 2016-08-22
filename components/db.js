var Redis = require('ioredis');
var Promise = require('ioredis').Promise;

var redisConfig = undefined;
if (process.env.NODE_ENV === 'production') {
  redisConfig = 'redis://:ZTNiMGM0NDI5OGZjMWMxNDlhZmJmNGM4OTk2ZmI5@' + process.env.OPENSHIFT_REDIS_HOST + ':' + process.env.OPENSHIFT_REDIS_PORT + '/0';
  console.log('****' + redisConfig);
}
var redis = new Redis(redisConfig);

var getAllFeeds = function (done) {
  var feeds = [];
  var promises = [];

  redis.keys('feed:*').then(function (keys) {
    keys.forEach(function (key) {
      promises.push(redis.hgetall(key));
    });
    Promise.all(promises).then(function (results) {
      results.forEach(function (feed) {
        feed.feed = JSON.parse(feed.feed);
        feeds.push(feed);
      });
      done(null, feeds);
    }).catch(function (err) {
      console.log('ERROR: When getting value by key from db');
      console.log(err);
      done(err);
    });
  }).catch(function (err) {
    console.log('ERROR: When getting keys from db');
    console.log(err);
    done(err);
  });
};

var db = {
  getAllFeedsAsync: function () {
    return new Promise(function (resolve, reject) {
      getAllFeeds(function (err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }
};

module.exports = db;
