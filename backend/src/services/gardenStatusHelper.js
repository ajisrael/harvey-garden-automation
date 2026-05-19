import db from '../utilities/db.js';
import { gardenStatusTableName } from '../constants/tableNames.js';
import {
  gardenStatusSaveError,
  gardenStatusSaveSuccess,
} from '../constants/messages.js';
import bedToPumpConfig from '../config/bedToPumpConfig.js';
import { getRecentGardenBedDataById } from './gardenBedHelper.js';

function calculateAverageOfStatus(gardenStatusData) {
  const totals = {};
  const gardenAverage = {};

  gardenStatusData.forEach((entry) => {
    removeUnnecessaryFieldsForCalculation(entry);
    populateTotals(totals, entry);
  });

  populateAverage(gardenAverage, totals, gardenStatusData.length);

  return gardenAverage;
}

function calculateAverageOfGardenBedData(gardenBedData) {
  const totals = {};

  gardenBedData.forEach((entry) => {
    removeUnnecessaryFieldsForCalculation(entry);
    populateTotals(totals, entry);
  });

  const bedAverage = {};

  populateAverage(bedAverage, totals, gardenBedData.length);

  return bedAverage;
}

function calculateBedAverages() {
  const bedIds = Object.keys(bedToPumpConfig);

  const bedAverages = [];

  bedIds.forEach((bedId) => {
    const gardenBedData = getRecentGardenBedDataById(bedId);
    const bedAverage = calculateAverageOfGardenBedData(gardenBedData);
    bedAverage.bedId = bedId;
    bedAverage.entryCount = gardenBedData.length;
    bedAverages.push(bedAverage);
  });

  return bedAverages;
}

function calculateNewGardenStatusForBed(
  currentGardenStatusData,
  gardenBedData
) {
  const bedId = gardenBedData.bedId;

  removeUnnecessaryFieldsForCalculation(gardenBedData);

  const entryCount = currentGardenStatusData.entryCount + 1;

  const totals = {};

  Object.keys(gardenBedData).forEach((field) => {
    totals[field] = currentGardenStatusData[field] + gardenBedData[field];
  });

  const newGardenStatus = {};

  Object.keys(totals).forEach((field) => {
    newGardenStatus[field] = totals[field] / entryCount;
  });

  newGardenStatus.bedId = bedId;
  newGardenStatus.entryCount = entryCount;

  return newGardenStatus;
}

function createGardenStatusTable() {
  return db.run(
    `CREATE TABLE ${gardenStatusTableName}( ` +
      'bedId TEXT PRIMARY KEY, ' +
      'airTemp REAL, ' +
      'soilTemp REAL, ' +
      'light REAL, ' +
      'moisture REAL, ' +
      'humidity REAL, ' +
      'entryCount REAL ' +
      '); ',
    {}
  );
}

function createSetMessageFromGardenStatusData(data) {
  const airTempUpdateMessage = data.airTemp ? `airTemp = ${data.airTemp}` : '';
  const soilTempUpdateMessage = data.soilTemp
    ? `soilTemp = ${data.soilTemp}`
    : '';
  const lightUpdateMessage = data.light ? `light = ${data.light}` : '';
  const moistureUpdateMessage = data.moisture
    ? `moisture = ${data.moisture}`
    : '';
  const humidityUpdateMessage = data.humidity
    ? `humidity = ${data.humidity}`
    : '';
  const entryCountUpdateMessage = data.entryCount
    ? `entryCount = ${data.entryCount}`
    : '';

  const airTempComma =
    soilTempUpdateMessage !== '' ||
    lightUpdateMessage !== '' ||
    moistureUpdateMessage !== '' ||
    humidityUpdateMessage !== '' ||
    entryCountUpdateMessage !== ''
      ? ', '
      : '';
  const soilTempComma =
    lightUpdateMessage !== '' ||
    moistureUpdateMessage !== '' ||
    humidityUpdateMessage !== '' ||
    entryCountUpdateMessage !== ''
      ? ', '
      : '';
  const lightComma =
    moistureUpdateMessage !== '' ||
    humidityUpdateMessage !== '' ||
    entryCountUpdateMessage !== ''
      ? ', '
      : '';
  const moistureComma =
    humidityUpdateMessage !== '' || entryCountUpdateMessage !== '' ? ', ' : '';
  const humidityComma = entryCountUpdateMessage !== '' ? ', ' : '';

  return (
    airTempUpdateMessage +
    airTempComma +
    soilTempUpdateMessage +
    soilTempComma +
    lightUpdateMessage +
    lightComma +
    moistureUpdateMessage +
    moistureComma +
    humidityUpdateMessage +
    humidityComma +
    entryCountUpdateMessage
  );
}

function deleteGardenStatusData() {
  return db.run(`DELETE FROM ${gardenStatusTableName};`, {});
}

function getGardenStatusData() {
  const data = db.query(`SELECT * FROM ${gardenStatusTableName}`, {});

  return data;
}

function getGardenStatusDataById(bedId) {
  const data = db.query(
    `SELECT * FROM ${gardenStatusTableName} WHERE bedId = '${bedId}' LIMIT 1`,
    {}
  );

  return data[0];
}

function populateAverage(average, totals, length) {
  Object.keys(totals).forEach((field) => {
    average[field] = totals[field] / length;
  });
}

function populateTotals(totals, entry) {
  Object.keys(entry).forEach((field) => {
    if (totals[field]) {
      totals[field] += entry[field];
    } else {
      totals[field] = entry[field];
    }
  });
}

function removeUnnecessaryFieldsForCalculation(data) {
  if (data.id) delete data.id;
  if (data.bedId) delete data.bedId;
  if (data.created_at) delete data.created_at;
  if (data.entryCount) delete data.entryCount;
}

function saveGardenStatusData(gardenStatusData) {
  const { bedId, airTemp, soilTemp, light, moisture, humidity, entryCount } =
    gardenStatusData;
  const result = db.run(
    `INSERT INTO ${gardenStatusTableName} (bedId, airTemp, soilTemp, light, moisture, humidity, entryCount) VALUES (@bedId, @airTemp, @soilTemp, @light, @moisture, @humidity, @entryCount)`,
    { bedId, airTemp, soilTemp, light, moisture, humidity, entryCount }
  );

  let message = gardenStatusSaveError;
  if (result.changes) {
    message = gardenStatusSaveSuccess;
  }

  return { message };
}

function updateGardenStatusData(bedId, data) {
  const setMessage = createSetMessageFromGardenStatusData(data);

  const result = db.run(
    `UPDATE ${gardenStatusTableName} SET ${setMessage} WHERE bedId = '${bedId}';`,
    {}
  );

  return result.changes !== 0;
}

export {
  calculateAverageOfStatus,
  calculateBedAverages,
  calculateNewGardenStatusForBed,
  createGardenStatusTable,
  deleteGardenStatusData,
  getGardenStatusData,
  getGardenStatusDataById,
  saveGardenStatusData,
  updateGardenStatusData,
};
