import JWT from 'jsonwebtoken';
import crypto from 'crypto';
import fs from 'fs';
import User from '../Model/userModel.js';
import AppError from '../utils/appError.js';
import { Email } from '../utils/email.js';

// TODO : Create JWT Token
const createSendToken = (user, statusCode, res) => {
  const token = JWT.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  const cookieOptions = {
    expires: new Date(
      Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };
  res.cookie('jwt', token, cookieOptions);
  user.password = undefined; // Remove password from response
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

// TODO : SignUp
export const signup = async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
    photo: req.file.filename,
  });
  const url = `${req.protocol}://${req.get('host')}/myProfile`;
  await new Email(newUser, url).sendWelcome();
  newUser.password = undefined;
  res.status(201).json({
    status: 'Success',
    user: { newUser },
  });
};

// TODO : Login
export const login = async (req, res, next) => {
  const { email, password } = req.body;

  // TODO : Check if email and password exist
  if (!email || !password) return next(new AppError('Please provide email and password', 400));

  // TODO : Check if user exists and password is correct
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError('Incorrect email or password', 401));

  // TODO : Check if user is active
  if (user.active == false)
    return next(new AppError('Your account is deactivated. Please contact support.', 403));

  // TODO : If everything is ok, send token to client
  createSendToken(user, 200, res);
};

export const protect = async (req, res, next) => {
  // TODO : Get token and check if it exists
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return next(new AppError('You are not logged in! Please log in to get access.', 401));

  // TODO : Verify token
  const decoded = JWT.verify(token, process.env.JWT_SECRET);
  if (!decoded) return next(new AppError('Invalid token. Please log in again.', 401));

  // TODO : Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser)
    return next(new AppError('The user belonging to this token does no longer exist.', 401));

  req.user = currentUser;
  next();
};

export const restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };

// TODO : Logout
export const logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
};

export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new AppError('Please provide your email address', 400));
  }
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError('There is no user with this email address', 404));
  }

  // TODO : Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
  user.passwordResetOTP = hashedOtp;
  user.passwordResetOTPExpires = Date.now() + 10 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  // TODO : Send OTP via email (implement your email sending logic here)
  const url = `${req.protocol}://${req.get('host')}/resetPassword`;
  try {
    await new Email(user, null).sendOTP(otp);
  } catch (err) {
    user.passwordResetOTP = undefined;
    user.passwordResetOTPExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('There was an error sending the email. Try again later!', 500));
  }

  res.status(200).json({
    status: 'success',
    message: 'OTP sent to email!',
  });
};

export const verifyOTP = async (req, res, next) => {
  const { otp } = req.body;
  if (!otp) {
    return next(new AppError('Please provide the OTP', 400));
  }
  const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
  const user = await User.findOne({ passwordResetOTP: hashedOtp });

  if (!user) return next(new AppError('Invalid OTP', 400));

  if (user.passwordResetOTPExpires < Date.now()) return next(new AppError('OTP has expired', 400));

  const token = JWT.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: Date.now() + 10 * 60 * 1000, // 10 minutes
  });
  res.status(200).json({
    status: 'success',
    message: 'OTP verified successfully',
    token,
  });
};

export const resetPassword = async (req, res, next) => {
  const { newPassword, confirmPassword } = req.body;
  const token = req.headers.authorization.split(' ')[1];
  if (!token) {
    return next(new AppError('Please provide a valid token', 401));
  }
  let decoded;
  try {
    decoded = JWT.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return next(new AppError('Invalid or expired token', 401));
  }

  if (!newPassword || !confirmPassword) {
    return next(new AppError('Please provide new password and confirm password', 400));
  }
  const user = await User.findById(decoded.id);
  user.password = newPassword;
  user.passwordConfirm = confirmPassword;
  user.passwordResetOTP = undefined;
  user.passwordResetOTPExpires = undefined;
  user.passwordChangedAt = new Date().toISOString();
  await user.save();
  createSendToken(user, 200, res);
};

export const updatePassword = async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  if (!currentPassword || !newPassword || !confirmPassword) {
    return next(
      new AppError('Please provide current password, new password and confirm password', 400)
    );
  }
  const user = await User.findById(req.user.id).select('+password');
  if (!user) {
    return next(new AppError('please log in to update your password', 404));
  }
  if (!(await user.correctPassword(currentPassword, user.password)))
    return next(new AppError('Invalid current password', 401));
  user.password = newPassword;
  user.passwordConfirm = confirmPassword;
  user.passwordChangedAt = new Date().toISOString();
  await user.save();
  createSendToken(user, 200, res);
};
