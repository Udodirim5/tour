const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name'],
    unique: true,
    trim: true,
    maxlength: [100, 'name must not exceed 50 characters'],
    minlength: [8, 'name must not be less than 8 characters']
  },

  email: {
    type: String,
    required: [true, 'A user must have a name'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Please enter a valid email address']
  },

  role: {
    type: String,
    default: 'user',
    enum: {
      values: ['user', 'admin', 'lead-guide', 'guide'],
      message: 'role must be admin lead-guide guide or user'
    }
  },

  password: {
    type: String,
    required: [true, 'User must provide a password'],
    minlength: [8, 'Password must be at least 8 characters long'],
    maxlength: [249, 'Password must not exceed 249 characters'],
    select: false
  },

  passwordConfirm: {
    type: String,
    required: [true, 'User must confirm their password'],
    validate: {
      validator: function(el) {
        return el === this.password;
      },
      message: 'Passwords do not match'
    }
  },

  photo: {
    type: String,
    default: 'default.jpg'
  },

  passwordChangedAt: Date,

  createdAt: {
    type: Date,
    default: Date.now(),
    select: false
  },

  passwordResetToken: {
    type: String
  },

  passwordResetExpires: {
    type: Date
  }
});

userSchema.pre('save', async function(next) {
  // only run this function if password was actually modified
  if (!this.isModified('password')) return next();
  // encrypt the password
  this.password = await bcrypt.hash(this.password, 12);
  // prevent the passwordConfirm from proceeding to the database
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  // Compare the encrypted password to the password from the user input
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// userSchema.pre(/^find/, function(next) {
//   this.find({ role: { $ne: 'admin' } });
//   next();
// });

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
