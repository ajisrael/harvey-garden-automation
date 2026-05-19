import { equal } from 'assert';
import { resetDB } from '../../../src/seeder.js';
import { stubLogs, restoreLogs } from '../../utilities/testHelper.js';
import gardenBedData from '../../../src/data/gardenBedData.js';
import {
  getGardenBedData,
  getGardenBedDataById,
  saveGardenBedData,
} from '../../../src/services/gardenBedHelper.js';
import serverConfig from '../../../src/config/serverConfig.js';
import { gardenBedSaveSuccess } from '../../../src/constants/messages.js';

describe('gardenBedHelper', () => {
  beforeEach((done) => {
    stubLogs();
    resetDB();
    done();
  });

  afterEach((done) => {
    restoreLogs();
    done();
  });

  describe('getGardenBedData', () => {
    it('should return a page of garden bed data', () => {
      const result = getGardenBedData();
      const expectedData = gardenBedData.slice(0, serverConfig.listPerPage - 1);

      equal(result.data.length, expectedData.length);

      for (let i = 0; i < result.data.length; i++) {
        equal(result.data[i].bedId, expectedData[i].bedId);
        equal(result.data[i].airTemp, expectedData[i].airTemp);
        equal(result.data[i].soilTemp, expectedData[i].soilTemp);
        equal(result.data[i].light, expectedData[i].light);
        equal(result.data[i].moisture, expectedData[i].moisture);
        equal(result.data[i].humidity, expectedData[i].humidity);
      }
    });
  });

  describe('getGardenBedDataById', () => {
    it('should return a page of data for one garden bed', () => {
      const result = getGardenBedDataById(1, 'Bed_0');

      const expectedData = gardenBedData.filter((entry) => {
        return entry.bedId === 'Bed_0';
      });

      equal(result.data.length, expectedData.length);

      for (let i = 0; i < result.data.length; i++) {
        equal(result.data[i].bedId, expectedData[i].bedId);
        equal(result.data[i].airTemp, expectedData[i].airTemp);
        equal(result.data[i].soilTemp, expectedData[i].soilTemp);
        equal(result.data[i].light, expectedData[i].light);
        equal(result.data[i].moisture, expectedData[i].moisture);
        equal(result.data[i].humidity, expectedData[i].humidity);
      }
    });
  });

  describe('saveGardenBedData', () => {
    it('should get success message after saving garden bed data', () => {
      const newGardenBedData = {
        bedId: 'Bed_5',
        airTemp: 91.1,
        soilTemp: 43.2,
        light: 0.8,
        moisture: 0.2,
        humidity: 0.9,
      };

      const message = gardenBedSaveSuccess;

      equal(saveGardenBedData(newGardenBedData).message, message);
    });
  });
});
