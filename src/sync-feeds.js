var uuid = require('uuid');
var Redis = require('ioredis');
var Promise = require('ioredis').Promise;
var parser = require('./parser');

var redisConfig = undefined;
if (process.env.NODE_ENV === 'production') {
  redisConfig = {
    port: process.env.OPENSHIFT_REDIS_PORT,
    host: process.env.OPENSHIFT_REDIS_HOST,
    family: 4,
    password: 'ZTNiMGM0NDI5OGZjMWMxNDlhZmJmNGM4OTk2ZmI5',
    db: 0
  };
}
var redis = new Redis(redisConfig);

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
        var dbKey = 'feed:' + feed.guid;
        redis.exists(dbKey).then(function (result) {
          if (!result) {
            redis.hmset(dbKey, {
              uuid: uuid.v4(),
              source: key,
              feed: JSON.stringify(feed)
            });
          }
        });
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
