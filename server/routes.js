module.exports = port => {
  const express = require('express');
  const path = require('path');
  const db = require('./db');
  const User = require('./User');

  const router = express.Router();

  router.get('/', (req, res, next) => {
    console.log('checkAuth:', req.session.userId);
    if (req.session.userId) {
      res.redirect('/home');
    } else {
      next();
    }
  }, (req, res) => {
    res.render('login');
  });

  router.get('/home', checkAuth, (req, res) => {
    User.getById(req.session.userId).then(user => {
      res.render('home', {
        user: user
      });
    });
  });

  router.get('/results', checkAuth, (req, res) => {
    User.getById(req.session.userId).then(user => {
      res.render('results', {
        user: user
      });
    });
  });

  router.get('/rosters', checkAuth, (req, res) => {
    User.getById(req.session.userId).then(user => {
      res.render('rosters', {
        user: user
      });
    });
  });

  router.post('/login', (req, res) => {
    let {email, password} = req.body;
    console.log(`Login request from ${email}.`);
    let query = 'SELECT id, password FROM Members WHERE email = $1 LIMIT 1';

    db.one(query, [email]).then(user => {
      if (user.password === password) {
        // Successful.
        console.log(`${email} logged in.`);

        req.session.userId = user.id;
        res.json({
          'logged_in': true
        });
      } else {
        // Wrong password.
        console.log(`${email} failed to log in.`);
        res.json({
          'logged_in': false,
          'message': 'Incorrect email or password.'
        });
      }
    }).catch(err => {
      // Couldn't find email.
      console.error('Query error: ', err);
      res.json({
        'logged_in': false,
        'message': 'Incorrect email or password.'
      });
    });
  });

  router.get('/logout', (req,res) => {
    req.session.destroy();
    res.clearCookie('connect.sid');
    res.redirect('/');
  });

  function checkAuth(req, res, next) {
    console.log('checkAuth:', req.session.userId);
    if (!req.session.userId) {
      res.redirect('/');
    } else {
      next();
    }
  }












  const config = require('./config');
  const credentials = {
    client: {
      id: config.clientId,
      secret: config.clientSecret
    },
    auth: {
      tokenHost: 'https://student.sbhs.net.au',
      tokenPath: '/api/token',
      authorizePath: '/api/authorize'
    }
  };
  const redirectUri = 'http://' + config.host + ':' + port + '/callback';
  const oauth2 = require('simple-oauth2').create(credentials);

  // Redirect login to SBHS Authorisation endpoint.
  router.get('/login/sbhs', (req, res) => {
    const authorizationUri = oauth2.authorizationCode.authorizeURL({
      redirect_uri: redirectUri,
      scope: 'all-ro',
      state: 'state'
    });
    console.log(`Redirecting to: ${authorizationUri} for auth.`);
    res.redirect(authorizationUri);
  });

  //
  router.get('/sbhslogout', (req, res) => {
    // delete req.session.whatever;
    res.redirect('/');
  });

  const request = require('request-promise-native');
  // Parse authorization token and request access token on callback.
  router.get('/callback', (req, res) => {
    // The code in the query parameter from authorization endpoint.
    const code = req.query.code;
    const options = {
      code,
      redirect_uri: redirectUri
    };

    oauth2.authorizationCode.getToken(options).then(result => {
      // Create token with useful helper methods.
      const token = oauth2.accessToken.create(result);
      console.log('Access token received 🎉🎉🎉.', token);

      request('https://student.sbhs.net.au/api/details/userinfo.json', {
        'auth': {
          'bearer': token.token.access_token
        }
      }).then(data => {
        data = JSON.parse(data);
        console.log('User data:', data);
        const studentId = data.username;
        const query = 'SELECT id, is_disabled FROM Members WHERE student_id = $1 LIMIT 1';
        db.one(query, [studentId]).then(data => {
          if (data.is_disabled) {
            return console.error(`User ${studentId}'s account is disabled.`);
            throw 'Account Disabled'; // TODO: Fix this.
          }

          console.log(studentId, 'logged in.');
          req.session.userId = data.id;
          res.redirect('/');
        }).catch(err => {
          console.log(`User ${studentId} not in Members table (or account disabled).`);
          res.json({
            'message': 'User not authorised to use Sailing Portal.'
          });
        });
      }).catch(err => {
        console.error('Failed to get user info from SBHS api:', err);
      });
    }).catch(error => {
      // Errors may be due to proxy, check env variables or npm settings.
      console.error('Access Token Error', error.message);
      // TODO: Better error handling.
      res.json({
        'logged_in': false,
        'message': 'SBHS Authentication failed.'
      });
    });
  });

  return router;
};
