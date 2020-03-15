var express = require('express');
var router = express.Router();

var pgp = require("pg-promise")();
var dbUrl;
try {
  dbUrl = require('./../config/dbConfig');
} catch (e) {
  console.log('no config file');
}
var db = pgp(dbUrl.postgresUrl);




/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/meetings', function(req, res, next) {
  db.any('SELECT * FROM meeting')
      .then(function(data) {
        console.log(data);
        res.send(data);// success;
      })
      .catch(function(error) {
        console.log('error in getting data from database: ', error);// error;
      });
});

module.exports = router;
