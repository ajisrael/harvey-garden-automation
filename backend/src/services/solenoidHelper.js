import db from '../utilities/db.js';
import { solenoidStateTableName } from '../constants/tableNames.js';
import serverConfig from '../config/serverConfig.js';
import {
  solenoidSaveError,
  solenoidSaveSuccess,
} from '../constants/messages.js';

function activateSolenoid(componentId) {
  let solenoidActivated = false;

  console.log(`Activating ${componentId} solenoid.`);

  solenoidActivated = updateSolenoidState(componentId, serverConfig.solenoidOn);

  setTimeout(() => {
    console.log(`Timeout for ${componentId} solenoid reached.`);
    deactivateSolenoid(componentId);
  }, serverConfig.solenoidDelay);

  return solenoidActivated;
}

function createSolenoidStateTable() {
  return db.run(
    `CREATE TABLE ${solenoidStateTableName}( ` +
      'id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
      'componentId TEXT UNIQUE, ' +
      'solenoidState INTEGER, ' +
      'entryActive INTEGER, ' +
      'created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL ' +
      '); ',
    {}
  );
}

function deactivateSolenoid(componentId) {
  console.log(`Deactivating ${componentId} solenoid.`);
  return updateSolenoidState(componentId, serverConfig.solenoidOff);
}

function deleteSolenoidStateData() {
  return db.run(`DELETE FROM ${solenoidStateTableName};`, {});
}

function getSolenoidStateData() {
  const data = db.query(`SELECT * FROM ${solenoidStateTableName}`, {});

  return {
    data,
  };
}

function getSolenoidStateDataById(componentId) {
  const data = db.query(
    `SELECT * FROM ${solenoidStateTableName} WHERE componentId = '${componentId}'`,
    {}
  );

  return {
    data,
  };
}

function getSolenoidStateById(componentId) {
  const solenoidStateData = db.query(
    `SELECT solenoidState FROM ${solenoidStateTableName} WHERE componentId = '${componentId}' LIMIT 1`,
    {}
  );
  return solenoidStateData[0].solenoidState;
}

function isSolenoidActive(componentId) {
  return getSolenoidStateById(componentId) !== 0;
}

function saveSolenoidStateData(solenoidStateData) {
  const { componentId, solenoidState, entryActive } = solenoidStateData;

  let message = solenoidSaveError;

  try {
    const result = db.run(
      `INSERT INTO ${solenoidStateTableName} (componentId, solenoidState, entryActive) VALUES (@componentId, @solenoidState, @entryActive)`,
      { componentId, solenoidState, entryActive }
    );

    if (result.changes) {
      message = solenoidSaveSuccess;
    }
  } catch (error) {
    if (
      error.message !== 'UNIQUE constraint failed: solenoidState.componentId'
    ) {
      throw new Error(error.message);
    }
  }

  return { message };
}

function updateSolenoidState(componentId, solenoidState) {
  const result = db.run(
    `UPDATE ${solenoidStateTableName} SET solenoidState = ${solenoidState} WHERE componentId = '${componentId}';`,
    {}
  );

  return result.changes !== 0;
}

export {
  activateSolenoid,
  createSolenoidStateTable,
  deactivateSolenoid,
  deleteSolenoidStateData,
  getSolenoidStateData,
  getSolenoidStateDataById,
  getSolenoidStateById,
  isSolenoidActive,
  saveSolenoidStateData,
};
