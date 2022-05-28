const mongoose = require('mongoose');

//catch all exception errors in the project as it's define before the app required
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION!, SHUTTING DOWN ....')
  console.log(err.name, err.message);
  process.exit(1);
})

const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const app = require('./app');

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)

mongoose.connect(DB, {
  useNewUrlParser: true
}).then(() => {
  console.log('DB connected!')
})

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

//handle unhandled rejected promises in all app
process.on('unhandledRejection', err => {
  console.log('UNHANDELED REJECTION!, SHUTTING DOWN ....')
  console.log(err.name, err.message);
  server.close(() => {
    // process.exit(1);
  })
})



