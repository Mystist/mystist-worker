var express = require('express');
var router = express.Router();
var _ = require('lodash');
var moment = require('moment');
var db = require('../components/db');

router.get('/', function(req, res, next) {
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
