var express = require('express');
var router = express.Router();
var db = require('../components/db');

router.get('/feeds', function (req, res, next) {
  db.getAllFeedsAsync().then(function (data) {
    res.json(data);
  });
});

module.exports = router;
