var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('page/index', { title: 'Express' });
});

// router.get('/game', function(req, res, next) {
//
//   let nickname = req.query.nickname;
//
//   console.log(nickname);
//
//   res.render('page/index', { title: 'Express' });
// });
//
// router.get('/server', function(req, res, next) {
//   res.render('page/server', { title: 'Express' });
// });

module.exports = router;
