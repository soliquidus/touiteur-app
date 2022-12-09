const mongoose = require('mongoose');
const config = require('./config')

mongoose.set('useNewUrlParser', true);
mongoose.set("useUnifiedTopology", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useUnifiedTopology", true);

class Database {
    constructor() {
        this.connect();
    }

    connect() {
        mongoose.connect(`mongodb+srv://${config.data.dbUser}:${config.data.dbPassword}@${config.data.dbHost}/${config.data.dbName}?retryWrites=true&w=majority`)
            .then(() => {
                console.log('Database successfully connected');
            })
            .catch(err => {
                console.log(`Error while connecting to database: ${err}` )
            })
    }
}

module.exports = new Database();
