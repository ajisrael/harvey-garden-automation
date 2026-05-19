import db from '../utilities/db.js';
import { pumpStateTableName } from '../constants/tableNames.js';
import { pumpSaveError, pumpSaveSuccess } from '../constants/messages.js';
import serverConfig from '../config/serverConfig.js';

function activatePump(componentId) {
  let pumpActivated = false;

  console.log(`Activating ${componentId} pump.`);

  pumpActivated = updatePumpState(componentId, serverConfig.pumpOn);

  setTimeout(() => {
    console.log(`Timeout for ${componentId} pump reached.`);
    deactivatePump(componentId);
  }, serverConfig.pumpDelay);

  return pumpActivated;
}

function createPumpStateTable() {
  return db.run(
    `CREATE TABLE ${pumpStateTableName}( ` +
      'id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
      'componentId TEXT UNIQUE, ' +
      'pumpState INTEGER, ' +
      'entryActive INTEGER, ' +
      'created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL ' +
      '); ',
    {}
  );
}

function deactivatePump(componentId) {
  console.log(`Deactivating ${componentId} pump.`);
  return updatePumpState(componentId, serverConfig.pumpOff);
}

function deletePumpStateData() {
  return db.run(`DELETE FROM ${pumpStateTableName};`, {});
}

function getPumpStateData() {
  const data = db.query(`SELECT * FROM ${pumpStateTableName}`, {});

  return {
    data,
  };
}

function getPumpStateDataById(componentId) {
  const data = db.query(
    `SELECT * FROM ${pumpStateTableName} WHERE componentId = '${componentId}'`,
    {}
  );

  return {
    data,
  };
}

function getPumpStateById(componentId) {
  const pumpStateData = db.query(
    `SELECT pumpState FROM ${pumpStateTableName} WHERE componentId = '${componentId}' LIMIT 1`,
    {}
  );
  return pumpStateData[0].pumpState;
}

function isPumpActive(componentId) {
  return getPumpStateById(componentId) !== 0;
}

function savePumpStateData(pumpStateData) {
  const { componentId, pumpState, entryActive } = pumpStateData;

  let message = pumpSaveError;

  try {
    const result = db.run(
      `INSERT INTO ${pumpStateTableName} (componentId, pumpState, entryActive) VALUES (@componentId, @pumpState, @entryActive)`,
      { componentId, pumpState, entryActive }
    );

    if (result.changes) {
      message = pumpSaveSuccess;
    }
  } catch (error) {
    if (error.message !== 'UNIQUE constraint failed: pumpState.componentId') {
      throw new Error(error.message);
    }
  }

  return { message };
}

function updatePumpState(componentId, pumpState) {
  const result = db.run(
    `UPDATE ${pumpStateTableName} SET pumpState = ${pumpState} WHERE componentId = '${componentId}';`,
    {}
  );

  return result.changes !== 0;
}

export {
  activatePump,
  createPumpStateTable,
  deactivatePump,
  deletePumpStateData,
  getPumpStateData,
  getPumpStateDataById,
  isPumpActive,
  savePumpStateData,
};
