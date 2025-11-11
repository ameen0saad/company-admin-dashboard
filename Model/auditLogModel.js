import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    enum: ['create', 'update', 'delete'],
    required: [true, 'action must have an action'],
  },
  modelName: {
    type: String,
    required: [true, 'action must have a model'],
  },
  documentId: {
    type: mongoose.Schema.ObjectId,
    required: [true, 'action must have a documentId'],
    refPath: 'modelName',
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'action must have a user'],
  },
  before: mongoose.Schema.Types.Mixed,
  after: mongoose.Schema.Types.Mixed,
  timestamp: {
    type: Date,
    default: Date.now,
  },
  changes: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
});
auditLogSchema.pre(/^find/, function (next) {
  this.populate([
    {
      path: 'user',
      select: 'name role email photo',
    },
    {
      path: 'documentId',
      select: 'name month email role salary year netPay bonus deductions',
      options: { skipInactiveFilter: true },
    },
  ]);

  next();
});
const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
