import multer from 'multer';
import sharp from 'sharp';
import crypto from 'crypto';
import User from '../Model/userModel.js';
import EmployeeProfile from '../Model/employeeProfileModel.js';
import * as factory from './handlerFactory.js';
import AppError from '../utils/appError.js';
import APIFeatures from '../utils/ApiFeatures.js';

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) cb(null, true);
  else {
    cb(new AppError('Not an Image! please upload only Images  ', 400), false);
  }
};

export const resizeUserPhoto = async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.params?.id || crypto.randomUUID()}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .toFormat('jpeg')
    .resize(500, 500)
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
export const deleteUser = async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { active: false },
    {
      new: true,
      runValidators: true,
    }
  );
  if (!user) return next(new AppError('No user found with that ID', 404));

  //  TODO :  delete associated employee profile if exists
  await EmployeeProfile.deleteOne({ employeeId: user._id });

  res.status(204).json({
    status: 'success',
    data: null,
  });
};

export const getUnassignedUsers = async (req, res) => {
  const users = await User.aggregate([
    {
      $match: {
        role: { $in: ['employee', 'hr'] },
        active: true,
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

export const getInactiveUsers = async (req, res, next) => {
  const features = new APIFeatures(
    User.find({ active: false }).setOptions({ skipInactiveFilter: true }),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const inactiveUser = await features.query;
  res.status(200).json({
    status: 'success',
    results: inactiveUser.length,
    data: inactiveUser,
  });
};
