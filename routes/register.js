const express = require('express');
const app = express();
const User = require('../schemas/userSchema');
const bcrypt = require('bcrypt');

// JSON parsing for application/json
app.use(express.json());

// URL encoding for applictation/x-www-form-urlencoded
app.use(express.urlencoded({extended: true}));

// Pug configuration and views location
app.set('view engine', 'pug');
app.set('views', 'views');

app.get('/', (req, res) => {
  let payload = {
    pageTitle: 'Touiteur - Créer mon compte',
  }
  res.status(200).render('register', payload);
});

/**
 * New User registration process
 */
app.post('/', async (req, res) => {
  let firstName = req.body.firstName.trim();
  let lastName = req.body.lastName.trim();
  let username = req.body.username.trim();
  let email = req.body.email.trim();
  let password = req.body.password.trim();
  let payload = req.body;
  payload.pageTitle = 'Touiteur - Créer mon compte';
  console.log(req.body);

  if (firstName && lastName && username && email && password) {
    // check if user already exists in database
    let user = await User.findOne({
      $or: [{ username: username }, { email: email }],
    }).catch((error) => {
      console.log(error);
      payload.errorMessage = 'Quelque chose s\'est mal passé';
      res.status(200).render('register', payload);
    });

    console.log(user);
    // if no user found, we proceed with the creation
    if (user === null) {
      let data = req.body;

      data.password = await bcrypt.hash(password, 10);
      User.create(data).then((user) => {
        console.log(user);
        req.session.user = user;
        return res.redirect('/');
      });
    } else {
      // if user is found, process stops and error messages are send
      if (email === user.email) {
        payload.errorMessage = 'Cette adresse mail est déjà utilisée.';
      } else {
        payload.errorMessage = 'Ce pseudo est déjà utilisé';
      }
      res.status(200).render('register', payload);
    }
  } else {
    // if any other error, general message is send
    payload.errorMessage = 'Assurez-vous d\'avoir rempli tous les champs';
    res.status(200).render('register', payload);
  }
});

module.exports = app;
