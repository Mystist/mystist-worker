var express = require('express');
var router = express.Router();
var _ = require('lodash');
var moment = require('moment');
var db = require('../src/components/db');

router.get('/', function (req, res, next) {
  var date = req.query.date;
  if (!date) {
    date = moment();
  }

  var currentDateString = moment.utc(date).utcOffset('+0800').format('YYYYMMDD');
  var eTimestamp = moment.utc(currentDateString).add(-8, 'hours').valueOf();
  var sTimestamp = moment.utc(eTimestamp).add(-1, 'day').valueOf();

  db.getFeedsBetweenTimestampsAsync(sTimestamp, eTimestamp).then(function (data) {
    res.render('index', {
      feeds: data,
      moment: moment,
      date: date
    });
  });
});

router.get('/all', function (req, res, next) {
  db.getAllFeedsAsync().then(function (data) {
    data = _.sortBy(data, function (feedObj) {
      return new Date(feedObj.feed.date).getTime();
    });
    res.render('index', {
      feeds: data.reverse(),
      moment: moment
    });
  });
});

module.exports = router;
