import { throwErrorWithMessagesOrCallNext } from './errorMiddleware.js';

function areBedIdsStrings(bedIds) {
  const nonStrings = bedIds.filter((bedId) => {
    return typeof bedId !== 'string';
  });
  return nonStrings.length === 0;
}

function validateActionCompleted(actionCompleted, messages) {
  if (!actionCompleted) {
    messages.push('actionCompleted is empty');
  } else if (typeof actionCompleted !== 'number') {
    messages.push('actionCompleted must be a number');
  }
}

function validateActionCompletedType(actionCompletedType, messages) {
  if (!actionCompletedType) {
    messages.push('actionCompletedType is empty');
  } else if (typeof actionCompletedType !== 'string') {
    messages.push('actionCompletedType must be a string');
  }
}

function validateActionId(actionId, messages) {
  if (!actionId) {
    messages.push('actionId is empty');
  } else if (typeof actionId !== 'number') {
    messages.push('actionId must be a number');
  }
}

function validateActionName(actionName, messages) {
  if (!actionName) {
    messages.push('actionName is empty');
  } else if (typeof actionName !== 'string') {
    messages.push('actionName must be a string');
  }
}

function validateActionType(actionType, messages) {
  if (!actionType) {
    messages.push('actionType is empty');
  } else if (typeof actionType !== 'string') {
    messages.push('actionType must be a string');
  }
}

function validateBedIds(bedIds, messages) {
  if (!bedIds) {
    messages.push('bedIds is empty');
  } else if (!Array.isArray(bedIds)) {
    messages.push('bedIds must be an array');
  } else if (bedIds.length === 0) {
    messages.push('bedIds must contain at least one bedId');
  } else if (!areBedIdsStrings(bedIds)) {
    messages.push('bedId in bedIds array must be a string');
  }
}

function validateActionGet(req, res, next) {
  let messages = [];

  if (Object.keys(req.body).length !== 0) {
    validateActionId(req.body.actionId, messages);
  }

  throwErrorWithMessagesOrCallNext(messages, res, next);
}

function validateActionPost(req, res, next) {
  let messages = [];

  if (Object.keys(req.body).length === 0) {
    messages.push('body required for request');
  } else {
    validateActionCompleted(req.body.actionCompleted, messages);
    validateActionCompletedType(req.body.actionCompletedType, messages);
    validateActionName(req.body.actionName, messages);
    validateActionType(req.body.actionType, messages);
    validateBedIds(req.body.bedIds, messages);
  }

  throwErrorWithMessagesOrCallNext(messages, res, next);
}

export { validateActionGet, validateActionPost };
