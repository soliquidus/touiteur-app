const express = require('express');
const app = express();
const middleware = require('./middlewares/loginMiddleware');
const path = require('path');
const session = require('express-session');
const config = require('./config/config');

app.listen(config.data.localPort, config.data.localHost, 1,
        () => console.log(`Serving on http://localhost:${config.data.localPort}`));

app.set('view engine', 'pug');
app.set('views', 'views');
app.use(express.static(path.join(__dirname, 'public')));

app.use(session(
    {
        secret: 'touite touite',
        resave: true,
        saveUninitialized: false
    }
))

// Routes
const loginRoute = require('./routes/login');

app.use('/login', loginRoute);

app.get('/', middleware.requireLogin, (req, res) => {
    let payload = {
        pageTitle: 'Home',
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user)
    };

    res.status(200).render('Home', payload);
})
