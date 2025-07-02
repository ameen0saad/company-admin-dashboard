import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Department name is required'],
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Department description is required'],
    },
    employeeCount: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
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

departmentSchema.virtual('employee', {
  ref: 'EmployeeProfile',
  foreignField: 'department',
  localField: '_id',
});

departmentSchema.pre('findOne', function (next) {
  this.populate([
    {
      path: 'employee',
    },
    {
      path: 'createdBy',
      select: 'name email role',
    },
    {
      path: 'updatedBy',
      select: 'name email role',
    },
  ]);
  next();
});

const Department = mongoose.model('Department', departmentSchema);

export default Department;
