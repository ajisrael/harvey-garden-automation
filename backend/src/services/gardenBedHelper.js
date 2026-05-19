import db from '../utilities/db.js';
import serverConfig from '../config/serverConfig.js';
import { gardenBedTableName } from '../constants/tableNames.js';
import {
  gardenBedSaveError,
  gardenBedSaveSuccess,
} from '../constants/messages.js';

function createGardenBedTable() {
  return db.run(
    `CREATE TABLE ${gardenBedTableName}( ` +
      'id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
      'bedId TEXT, ' +
      'airTemp REAL, ' +
      'soilTemp REAL, ' +
      'light REAL, ' +
      'moisture REAL, ' +
      'humidity REAL, ' +
      'created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL ' +
      '); ',
    {}
  );
}

function deleteGardenBedData() {
  return db.run(`DELETE FROM ${gardenBedTableName};`, {});
}

function getGardenBedData(page = 1) {
  const offset = (page - 1) * serverConfig.listPerPage;
  const data = db.query(`SELECT * FROM ${gardenBedTableName} LIMIT ?,?`, [
    offset,
    serverConfig.listPerPage,
  ]);
  const meta = { page };

  return {
    data,
    meta,
  };
}

function getGardenBedDataById(page = 1, bedId) {
  const offset = (page - 1) * serverConfig.listPerPage;
  const data = db.query(
    `SELECT * FROM ${gardenBedTableName} WHERE bedId = '${bedId}' LIMIT ?,?`,
    [offset, serverConfig.listPerPage]
  );
  const meta = { page };

  return {
    data,
    meta,
  };
}

function getRecentGardenBedDataById(bedId) {
  return db.query(
    `SELECT * FROM ${gardenBedTableName} WHERE bedId = '${bedId}' ORDER BY created_at DESC LIMIT ${serverConfig.gardenBedAverageWindow}`,
    {}
  );
}

function saveGardenBedData(gardenBedData) {
  const { bedId, airTemp, soilTemp, light, moisture, humidity } = gardenBedData;
  const result = db.run(
    `INSERT INTO ${gardenBedTableName} (bedId, airTemp, soilTemp, light, moisture, humidity) VALUES (@bedId, @airTemp, @soilTemp, @light, @moisture, @humidity)`,
    { bedId, airTemp, soilTemp, light, moisture, humidity }
  );

  let message = gardenBedSaveError;
  if (result.changes) {
    message = gardenBedSaveSuccess;
  }

  return { message };
}

export {
  createGardenBedTable,
  deleteGardenBedData,
  getGardenBedData,
  getGardenBedDataById,
  getRecentGardenBedDataById,
  saveGardenBedData,
};
