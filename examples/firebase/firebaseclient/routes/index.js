var express = require('express');
var router = express.Router();



/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express', app: 'workitem', controller: 'mainCtrl'  });
});


/* GET login partial. */
router.get('/partials/login', function (req, res) {
    res.render('partials/login');
});

router.get('/partials/signup', function (req, res) {
    res.render('partials/signup');
});


router.get('/partials/authorize', function (req, res) {
    res.render('partials/authorize');
});

router.get('/partials/firespec', function (req, res) {
    res.render('partials/firespec');
});


router.get('/partials', function (req, res) {
    console.log('serving partial with name '+ req.params.name)
    res.render('partials/'+ req.params.name);
});

/*
router.get('/login', function (req, res) {
    res.render('login', { title: 'Login', app: 'workitem', controller: 'loginCtrl' });
});


router.get('/firespecs', function (req, res) {
    res.render('firespec', { title: 'Firepad', app:'workitem', controller:'workitemCtrl' });
});
*/
module.exports = router;
