var uuid = require('uuid');
var moment = require('moment');
var Redis = require('ioredis');
var Promise = require('ioredis').Promise;
var parser = require('./parser');
var redisClientConfig = require('./components/redis-client-config');
var redis = new Redis(redisClientConfig);

var dict = {
  '36kr': 'http://36kr.com/feed',
  'huxiu': 'https://www.huxiu.com/rss/0.xml',
  'ifanr': 'http://www.ifanr.com/feed',
  'tech2ipo': 'http://tech2ipo.com/feed',
  'hackernews': 'https://news.ycombinator.com/rss',
  'pmcaff': 'http://www.pmcaff.com/site/rss',
  'woshipm': 'http://www.woshipm.com/feed',
  'techcrunch': 'http://techcrunch.cn/feed/',
  'smzdm': 'http://post.smzdm.com/feed'
};

var state = {
  triedTimes: 1,
  maxCanTryTimes: 30,
  waitTime: 60 * 1000
}

var fetchAll = function (next) {
  var promises = [];

  Object.keys(dict).forEach(function(key) {
    var value = dict[key];

    var promise = parser.fetchAsync(value);
    promise.then(function (data) {
      data.forEach(function (feed) {
        var hashKey = '';
        var setKeyOfTimestamp = '';

        if (feed.guid && feed.date) {
          hashKey = 'feed:' + feed.guid;
          setKeyOfTimestamp = 'feed:timestamp';

          redis.exists(hashKey).then(function (result) {
            if (!result) {
              redis.hmset(hashKey, {
                uuid: uuid.v4(),
                source: key,
                feed: JSON.stringify(feed)
              });
            }
          });
          // Add timestamp index for feed
          redis.zscore(setKeyOfTimestamp, feed.guid).then(function (result) {
            if (!result) {
              redis.zadd(setKeyOfTimestamp, moment.utc(feed.date).valueOf(), feed.guid);
            }
          });
        }
      });
    }).catch(function (err) {
      console.log('ERROR: Failed of fetching data from [' + value + ']');
      console.log(err, err.stack);
    });

    promises.push(promise);
  });

  Promise.all(promises).then(function () {
    next();
  }).catch(function (err) {
    next(err);
  });
};

var fetchAllNext = function (err) {
  if (err) {
    if (state.triedTimes < state.maxCanTryTimes) {
      setTimeout(function () {
        state.triedTimes++;
        console.log('INFO: Trying for the ' + state.triedTimes + 'th time');
        fetchAll(fetchAllNext);
      }, state.waitTime);
    } else {
      console.log('FATAL: Error occurs during fetching feeds');
    }
  } else {
    console.log('SUCCESS: All feeds has been fetched successfully');
  }
};

var syncFeeds = {
  initialize: function () {
    fetchAll(fetchAllNext);
  }
};

module.exports = syncFeeds;
