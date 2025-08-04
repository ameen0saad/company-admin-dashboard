import mongoose from 'mongoose';
import validator from 'validator';

import Department from './departmentModel.js';

const employeeProfileSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'EmployeeProfile must have employeeId'],
      unique: true,
    },
    department: {
      type: mongoose.Schema.ObjectId,
      ref: 'Department',
      required: [true, 'EmployeeProfile must have department'],
    },
    salary: {
      type: Number,
      required: [true, 'Employee must have a salary '],
    },
    phone: {
      type: String,
      required: [true, 'EmployeeProfile must have phone number '],
      validate: {
        validator: (value) => validator.isMobilePhone(value, 'any'),
        message: 'please Provide a valid phone number',
      },
    },
    joiningDate: {
      type: Date,
      default: Date.now(),
    },
    address: {
      type: String,
      required: [true, 'Employee must have an address '],
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Employee must have a  date of birth'],
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
    updatedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
employeeProfileSchema.index({ department: 1, active: 1 });

employeeProfileSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'department',
    select: 'name',
  }).populate({
    path: 'employeeId',
    match: { active: { $ne: false } },
    select: 'name email role photo',
  });
  next();
});

employeeProfileSchema.post('save', async function () {
  const employeeCount = await EmployeeProfile.countDocuments({
    department: this.department,
  });
  await Department.findByIdAndUpdate(this.department, {
    employeeCount,
  });
  console.log(employeeCount);
});

employeeProfileSchema.post(['findOneAndUpdate', 'findOneAndDelete'], async function (doc) {
  if (!doc) return;
  const employeeCount = await EmployeeProfile.countDocuments({
    department: doc.department,
  });
  await Department.findByIdAndUpdate(doc.department, {
    employeeCount,
  });
});

employeeProfileSchema.virtual('Payrolls', {
  ref: 'Payroll',
  foreignField: 'employeeProfileId',
  localField: '_id',
});

employeeProfileSchema.pre('findOne', function () {
  this.populate([
    {
      path: 'createdBy',
      select: 'name email role',
    },
    {
      path: 'updatedBy',
      select: 'name email role',
    },
  ]);
});

const EmployeeProfile = mongoose.model('EmployeeProfile', employeeProfileSchema);
export default EmployeeProfile;
