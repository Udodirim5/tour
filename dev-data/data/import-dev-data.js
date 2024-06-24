const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Tour = require('./../../models/tourModel');
const User = require('./../../models/userModel');
const Review = require('./../../models/reviewModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => console.log('DB Connection Established!'))
  .catch(err => console.error('DB Connection Error:', err));

// READ JSON FILES
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

// IMPORT DATA INTO THE DATABASE
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Tours data imported successfully');
    await User.create(users, { validateBeforeSave: false });
    console.log('Users data imported successfully');
    await Review.create(reviews);
    console.log('Reviews data imported successfully');
    process.exit();
  } catch (err) {
    console.error('Error importing data:', err);
  }
};

// DELETE ALL DATA FROM COLLECTIONS AND THEN IMPORT NEW ONE
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Data deleted successfully');
    process.exit();
  } catch (err) {
    console.error('Error deleting data:', err);
  }
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

// node dev-data/data/import-dev-data.js --delete
