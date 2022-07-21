const mongoose = require('mongoose');
const config = require('config')
const dbConfig = config.get('Customer.dbConfig')

mongoose.connect(dbConfig.url, {
    auth: {
        user: dbConfig.username,
        password: dbConfig.password
    },
    useNewUrlParser: true,
    useUnifiedTopology: true,
    retryWrites: false,
    useCreateIndex: true
})
.then(() => console.log(`Connected to #${dbConfig.name}!`)) 
.catch((err) => console.error(err)); 