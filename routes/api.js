var express = require('express');
var router = express.Router();
var moment = require('moment');
var db = require('../src/components/db');

router.get('/feeds/:date', function (req, res, next) {
  var date = req.params.date;
  var currentDateString = moment.utc(date).utcOffset('+0800').format('YYYYMMDD');
  var eTimestamp = moment.utc(currentDateString).add(-8, 'hours').valueOf();
  var sTimestamp = moment.utc(eTimestamp).add(-1, 'day').valueOf();

  db.getFeedsBetweenTimestampsAsync(sTimestamp, eTimestamp).then(function (data) {
    res.json(data);
  });
});

module.exports = router;
