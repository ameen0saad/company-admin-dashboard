import mongoose from 'mongoose';
import EmployeeProfile from './employeeProfileModel.js';
const payrollSchema = new mongoose.Schema(
  {
    employeeProfileId: {
      type: mongoose.Schema.ObjectId,
      ref: 'EmployeeProfile',
      required: [true, 'Employee ID is required'],
    },
    bonus: {
      type: Number,
      default: 0,
    },
    deductions: {
      type: Number,
      default: 0,
    },
    netPay: {
      type: Number,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    month: {
      type: String,
      default: function () {
        return new Date(Date.now()).toLocaleString('default', {
          month: 'long',
        });
      },
    },
    year: {
      type: Number,
      default: function () {
        return new Date(Date.now()).getFullYear();
      },
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

payrollSchema.index(
  { employeeProfileId: 1, month: 1, year: 1 },
  { unique: true }
);

payrollSchema.index({ month: 1 });
payrollSchema.index({ year: 1 });

payrollSchema.pre('save', async function (next) {
  const empProfile = await EmployeeProfile.findById(this.employeeProfileId);
  this.netPay = empProfile.salary + this.bonus - this.deductions;
  next();
});
payrollSchema.pre('findOne', function (next) {
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
  next();
});

const Payroll = mongoose.model('Payroll', payrollSchema);
export default Payroll;
