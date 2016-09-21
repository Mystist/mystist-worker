var moment = require('moment');
var Redis = require('ioredis');
var Promise = require('ioredis').Promise;
var redisClientConfig = require('./redis-client-config');
var redis = new Redis(redisClientConfig);

var getAllFeeds = function (done) {
  var feeds = [];
  var promises = [];

  redis.keys('feed:http*').then(function (keys) {
    keys.forEach(function (key) {
      promises.push(redis.hgetall(key));
    });
    getFeedsFromPromises(promises, done);
  });
};

var getFeedsBetweenTimestamps = function (sTimestamp, eTimestamp, done) {
  var promises = [];

  redis.zrangebyscore('feed:timestamp', sTimestamp, eTimestamp).then(function (results) {
    results.forEach(function (key) {
      var hashKey = 'feed:' + key;
      promises.push(redis.hgetall(hashKey));
    });
    getFeedsFromPromises(promises, done);
  });
};

var getFeedsFromPromises = function (promises, done) {
  var feeds = [];

  Promise.all(promises).then(function (results) {
    results.forEach(function (feedObj) {
      if (feedObj.feed) {
        feedObj.feed = JSON.parse(feedObj.feed);
        feeds.push(feedObj);
      }
    });
    done(null, feeds);
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
  },
  getFeedsBetweenTimestampsAsync: function (sTimestamp, eTimestamp) {
    return new Promise(function (resolve, reject) {
      getFeedsBetweenTimestamps(sTimestamp, eTimestamp, function (err, data) {
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
