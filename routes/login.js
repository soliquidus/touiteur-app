const express = require('express');
const app = express();

// JSON parsing
app.use(express.json());

// URL encoding for applictation/x-www-form-urlencoded
app.use(express.urlencoded({extended: true}));

// Pug configuration and views location
app.set('view engine', 'pug');
app.set('views', 'views');

app.get('/', (req, res) => {
    let payload = {
        pageTitle: 'Touiteur - Connectez vous !'
    }
    res.status(200).render('login', payload);
})

module.exports = app;
