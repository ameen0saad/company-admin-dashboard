import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import EmployeeProfile from './employeeProfileModel.js';
import { Email } from '../utils/email.js';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'User name is required'],
  },
  email: {
    type: String,
    required: [true, 'User email is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email '],
  },
  role: {
    type: String,
    enum: ['admin', 'employee', 'hr'],
    default: 'employee',
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  active: {
    type: Boolean,
    default: true,
  },
  password: {
    type: String,
    required: [true, 'User password is required'],
    minlength: [8, 'password must be above 8 '],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!',
    },
  },
  passwordChangedAt: {
    type: Date,
  },
  passwordResetOTP: {
    type: String,
  },
  passwordResetOTPExpires: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    immutable: true,
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
});
userSchema.index({ role: 1 });

userSchema.pre(/^find/, function (next) {
  if (!(this.getOptions && this.getOptions().skipInactiveFilter)) {
    this.find({ active: { $ne: false } });
  }
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', async function (next) {
  if (this.isModified('active') && this.active === true) next();
});

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);
export default User;
