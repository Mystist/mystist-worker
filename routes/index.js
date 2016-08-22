var express = require('express');
var router = express.Router();
var _ = require('lodash');
var moment = require('moment');
var db = require('../components/db');

router.get('/', function(req, res, next) {
  db.getAllFeedsAsync().then(function (data) {
    var data = _.sortBy(data, function (feed) {
      return new Date(feed.feed.date).getTime();
    });
    res.render('index', {
      feeds: data.reverse(),
      moment: moment
    });
  });
});

module.exports = router;
