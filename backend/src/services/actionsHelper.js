import db from '../utilities/db.js';
import serverConfig from '../config/serverConfig.js';
import { actionTableName } from '../constants/tableNames.js';
import { actionsSaveError, actionsSaveSuccess } from '../constants/messages.js';

function createActionTable() {
  return db.run(
    `CREATE TABLE ${actionTableName}( ` +
      'id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
      'actionName TEXT UNIQUE, ' +
      'bedIds BLOB, ' +
      'actionType TEXT, ' +
      'actionCompletedType TEXT, ' +
      'actionCompleted REAL, ' +
      'created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL ' +
      '); ',
    {}
  );
}

function deleteActionData() {
  return db.run(`DELETE FROM ${actionTableName};`, {});
}

function convertActionDataBedIdsToArray(actionData) {
  let convertedActionData = [];

  actionData.forEach((entry) => {
    const convertedEntry = {
      id: entry.id,
      actionName: entry.actionName,
      actionType: entry.actionType,
      actionCompletedType: entry.actionCompletedType,
      actionCompleted: entry.actionCompleted,
    };

    convertedEntry.bedIds = entry.bedIds.split(',');

    convertedActionData.push(convertedEntry);
  });

  return convertedActionData;
}

function getActionData(page = 1) {
  const offset = (page - 1) * serverConfig.listPerPage;
  const rawData = db.query(`SELECT * FROM ${actionTableName} LIMIT ?,?`, [
    offset,
    serverConfig.listPerPage,
  ]);
  const meta = { page };

  const data = convertActionDataBedIdsToArray(rawData);

  return {
    data,
    meta,
  };
}

function getActionDataById(id) {
  const rawData = db.query(
    `SELECT * FROM ${actionTableName} WHERE id = '${id}' LIMIT 1`,
    {}
  );

  const data = convertActionDataBedIdsToArray(rawData);

  return data[0];
}

function getActionDataByName(actionName) {
  const rawData = db.query(
    `SELECT * FROM ${actionTableName} WHERE actionName = '${actionName}' LIMIT 1`,
    {}
  );

  const data = convertActionDataBedIdsToArray(rawData);

  return data[0];
}

function saveActionData(actionData) {
  const {
    actionName,
    bedIds,
    actionType,
    actionCompletedType,
    actionCompleted,
  } = actionData;
  const bedIdsString = bedIds.join(',');
  const result = db.run(
    `INSERT INTO ${actionTableName} (actionName, bedIds, actionType, actionCompletedType, actionCompleted) ` +
      `VALUES (@actionName, @bedIdsString, @actionType, @actionCompletedType, @actionCompleted)`,
    {
      actionName,
      bedIdsString,
      actionType,
      actionCompletedType,
      actionCompleted,
    }
  );

  let message = actionsSaveError;
  if (result.changes) {
    message = actionsSaveSuccess;
  }

  return { message };
}

export {
  createActionTable,
  deleteActionData,
  getActionData,
  getActionDataById,
  getActionDataByName,
  saveActionData,
};
