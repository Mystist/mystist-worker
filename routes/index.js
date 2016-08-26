var express = require('express');
var router = express.Router();
var _ = require('lodash');
var moment = require('moment');
var db = require('../components/db');

router.get('/', function(req, res, next) {
  var sTimestamp = moment(moment().utcOffset('+0800').format('YYYYMMDD')).add(-1, 'day').valueOf();
  var eTimestamp = moment(moment().utcOffset('+0800').format('YYYYMMDD')).valueOf();

  db.getFeedsBetweenTimestampsAsync(sTimestamp, eTimestamp).then(function (data) {
    res.render('index', {
      feeds: data,
      moment: moment
    });
  });
});

module.exports = router;
