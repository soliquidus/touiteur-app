const express = require("express");
const app = express();
const middleware = require("./middlewares/loginMiddleware");
const path = require("path");
const mongoose = require("./config/database"); // mongoose import needed to connect to database
const session = require("express-session");
const config = require('./config/config')

app.listen(config.data.localPort, () => console.log(`Serving on http://${config.data.localHost}:${config.data.localPort}`));

app.set("view engine", "pug");
app.set("views", "views");
app.use(express.static(path.join(__dirname, "public")));

app.use(
    session({
        secret: 'touite touite',
        resave: true,
        saveUninitialized: false,
    })
);

// Routes
const loginRoute = require('./routes/login');
const registerRoute = require('./routes/register');

app.use('/login', loginRoute);
app.use('/register', registerRoute);


app.get('/', middleware.requireLogin, (req, res) => {
    let payload = {
        pageTitle: 'Touiteur - Accueil',
        userLoggedIn: req.session.user,
        userLoggInedJs: JSON.stringify(req.session.user),
    };
    res.status(200).render('Home', payload);
});
