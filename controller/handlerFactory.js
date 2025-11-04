import AppError from '../utils/appError.js';
import APIFeatures from '../utils/ApiFeatures.js';
import AuditLog from '../Model/auditLogModel.js';
import User from '../Model/userModel.js';
import EmployeeProfile from '../Model/employeeProfileModel.js';
import { Email } from '../utils/email.js';

// TODO : Log audit trail for create, update, and delete operations
export const logAudit = async ({ action, model, documentId, user, before, after, changes }) => {
  await AuditLog.create({
    action,
    model,
    documentId,
    user,
    before,
    after,
    changes,
  });
};

const getDiff = (oldDoc, reqBody) => {
  const changes = {};
  const ignoredKeys = ['createdBy', 'updatedBy'];

  const oldData = oldDoc.toObject ? oldDoc.toObject() : oldDoc;
  const newData = reqBody.toObject ? reqBody.toObject() : reqBody;

  for (const key in newData) {
    if (ignoredKeys.includes(key)) continue;
    if (
      Object.prototype.hasOwnProperty.call(oldData, key) &&
      String(oldData[key]) !== String(newData[key])
    ) {
      changes[key] = {
        from: oldData[key],
        to: newData[key],
      };
    }
  }

  return changes;
};

export const getAll = (Model) => async (req, res, next) => {
  const features = new APIFeatures(Model.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const doc = await features.query;
  res.status(200).json({
    status: 'success',
    results: doc.length,
    data: {
      doc,
    },
  });
};

export const getOne = (Model, popOptions) => async (req, res, next) => {
  let query = Model.findById(req.params.id);
  if (popOptions) query = query.populate(popOptions);
  const doc = await query;
  if (!doc) return next(new AppError('No document found with that ID', 404));

  res.status(200).json({
    status: 'success',
    data: {
      doc,
    },
  });
};

export const createOne = (Model) => async (req, res, next) => {
  delete req.body.createdBy;
  req.body.createdBy = req.user._id;
  const doc = await Model.create(req.body);
  await logAudit({
    action: 'create',
    model: Model.modelName,
    documentId: doc._id,
    user: req.user._id,
  });

  res.status(201).json({
    status: 'success',
    data: {
      doc,
    },
  });
};

export const updateOne = (Model) => async (req, res, next) => {
  delete req.body.createdBy;
  req.body.updatedBy = req.user._id;
  if (req.file) {
    req.body.photo = req.file.filename;
  }
  const oldDoc = await Model.findById(req.params.id).setOptions({ skipInactiveFilter: true });
  const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
    runValidators: true,
    new: true,
  }).setOptions({ skipInactiveFilter: true });

  if (!doc) return next(new AppError('No document found with that ID', 404));

  const changes = getDiff(oldDoc, req.body);

  if (Object.keys(changes).length > 0) {
    await logAudit({
      action: 'update',
      model: Model.modelName,
      documentId: doc._id,
      user: req.user._id,
      changes,
    });
  }
  res.status(200).json({
    status: 'success',
    data: {
      doc,
    },
  });
};

export const deleteOne = (Model) => async (req, res, next) => {
  const doc = await Model.findByIdAndDelete(req.params.id);
  if (!doc) return next(new AppError('No document found with that ID', 404));

  await logAudit({
    action: 'delete',
    model: Model.modelName,
    documentId: doc._id,
    user: req.user._id,
    before: doc,
    after: null,
  });
  res.status(204).json({
    status: 'success',
    data: null,
  });
};
