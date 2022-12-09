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

/**
 * Login page
 */
app.get('/', (req, res) => {
    let payload = {
        pageTitle: 'Touiteur - Connectez vous !'
    }
    res.status(200).render('login', payload);
})

/**
 * New user form post request process
 */
app.post('/', async (req, res) => {
    let reqBody = req.body;
    let payload = {};

    if (reqBody.loginUsername && reqBody.loginPassword) {
        let user = await User.findOne({
            $or: [
                {username: req.body.loginUsername},
                {email: req.body.loginUsername},
            ],
        }).catch(err => {
            console.log(err)
            payload = {
                pageTitle: 'Touiteur - Connectez vous !',
                errorMessage: 'Quelque chose s\'est mal passé'
            }
            res.status(200).render("login", payload);
        });

        // Check if password matches
        if (user != null) {
            let result = await bcrypt.compare(req.body.loginPassword, user.password);
            if (result) {
                req.session.user = user;
                return res.redirect('/');
            }
        }
        payload = {
            pageTitle: 'Touiteur - Connectez vous !',
            errorMessage: 'Quelque chose s\'est mal passé'
        }
        return res.status(200).render('login', payload);
    }

    // Retry if given entries are not found
    payload.errorMessage = 'Identifiants incorrect, veuillez réessayer';
    return res.status(200).render('login');
});

module.exports = app;
