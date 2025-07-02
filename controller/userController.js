import multer from 'multer';
import sharp from 'sharp';
import crypto from 'crypto';
import User from '../Model/userModel.js';
import EmployeeProfile from '../Model/employeeProfileModel.js';
import * as factory from './handlerFactory.js';
import AppError from '../utils/appError.js';

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) cb(null, true);
  else {
    cb(new AppError('Not an Image! please upload only Images  ', 400), false);
  }
};

export const resizeUserPhoto = async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${
    req.params?.id || crypto.randomUUID()
  }-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

export const uploadUserPhoto = upload.single('photo');
export const getAllUsers = factory.getAll(User);
export const getUser = factory.getOne(User);
export const updateUser = factory.updateOne(User);
export const deleteUser = factory.deleteOne(User);

export const getUnassignedUsers = async (req, res) => {
  const users = await User.aggregate([
    {
      $match: {
        role: { $in: ['employee', 'hr'] },
      },
    },
    {
      $lookup: {
        from: 'employeeprofiles',
        localField: '_id',
        foreignField: 'employeeId',
        as: 'profile',
      },
    },
    {
      $match: {
        profile: { $eq: [] },
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: users,
  });
};
