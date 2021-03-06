const express = require('express');
const bcrypt = require('bcrypt');

const User = require('../models/user-model.js');


const authRoutes = express.Router();


authRoutes.get('/signup', (req, res, next) => {
  res.render('auth/signup-view.ejs');
});


// <form method="post" action="/signup">
authRoutes.post('/signup', (req, res, next) => {
  const signupUsername = req.body.signupUsername;
  const signupPassword = req.body.signupPassword;

  // Don't let users submit blank usernames or passwords
  if (signupUsername === '' || signupPassword === '') {
    res.render('auth/signup-view.ejs', {
      errorMessage: 'Please provide both username and password.'
    });
    return;
  }

  // Check password length, characters, etc. (we are ignoring that here)

  User.findOne(
    // 1st arg -> criteria of the findOne (which documents)
    { username: signupUsername },
    // 2nd arg -> projection (which fields)
    { username: 1 },
    // 3rd arg -> callback
    (err, foundUser) => {
      if (err) {
        next(err);
        return;
      }

      // Don't let the user register if the username is taken
      if (foundUser) {
        res.render('auth/signup-view.ejs', {
          errorMessage: 'Username is taken, sir or madam.'
        });
        return;
      }

      // We are good to go, time to save the user.

      // Encrypt the password
      const salt = bcrypt.genSaltSync(10);
      const hashPass = bcrypt.hashSync(signupPassword, salt);

      // Create the user
      const theUser = new User({
        name: req.body.signupName,
        username: signupUsername,
        encryptedPassword: hashPass
      });

      // Save it
      theUser.save((err) => {
        if (err) {
          next(err);
          return;
        }

        // Redirect to home page if save is successful
        res.redirect('/');
      });
    }
  );
});


module.exports = authRoutes;
