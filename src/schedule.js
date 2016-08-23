var nodeSchedule = require('node-schedule');
var syncFeeds = require('./sync-feeds');

var scheduleFeeds = function () {
  nodeSchedule.scheduleJob('0 * * * *', function () {
    syncFeeds.initialize();
    console.log('SCHEDULE: Sync feeds started at: ' + new Date().toString());
  });
};

var schedule = {
  initialize: function () {
    scheduleFeeds();
  }
};

module.exports = schedule;
