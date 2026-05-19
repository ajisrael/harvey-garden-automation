import chai from 'chai';
import bedToPumpConfig from '../../../src/config/bedToPumpConfig.js';
import { gardenStatusSaveSuccess } from '../../../src/constants/messages.js';
import gardenBedData from '../../../src/data/gardenBedData.js';
import { resetDB } from '../../../src/seeder.js';
import { getGardenBedDataById } from '../../../src/services/gardenBedHelper.js';
import {
  calculateAverageOfStatus,
  calculateNewGardenStatusForBed,
  getGardenStatusData,
  getGardenStatusDataById,
  saveGardenStatusData,
  updateGardenStatusData,
} from '../../../src/services/gardenStatusHelper.js';
import { stubLogs, restoreLogs } from '../../utilities/testHelper.js';

const should = chai.should();

describe('gardenStatusHelper', () => {
  beforeEach((done) => {
    stubLogs();
    resetDB();
    done();
  });

  afterEach((done) => {
    restoreLogs();
    done();
  });

  describe('calculateAverageOfStatus', () => {
    it('should calculate the average of all gardenStatusData passed', () => {
      const gardenStatusData = getGardenStatusData();
      const result = calculateAverageOfStatus(gardenStatusData);

      result.should.be.a('object');
      result.airTemp.should.be.a('number');
      result.soilTemp.should.be.a('number');
      result.light.should.be.a('number');
      result.moisture.should.be.a('number');
      result.humidity.should.be.a('number');
    });
  });

  describe('calculateNewGardenStatusForBed', () => {
    it('should calculate the new status of a bed', () => {
      const bedId = gardenBedData[0].bedId;
      const newGardenBedData = {
        bedId: bedId,
        airTemp: 41.8,
        soilTemp: 43.2,
        light: 0.8,
        moisture: 0.2,
        humidity: 0.9,
      };
      const currentGardenBedData = getGardenBedDataById(1, bedId).data;
      const newEntryCount = currentGardenBedData.length + 1;
      const averages = {
        airTemp: newGardenBedData.airTemp,
        soilTemp: newGardenBedData.soilTemp,
        light: newGardenBedData.light,
        moisture: newGardenBedData.moisture,
        humidity: newGardenBedData.humidity,
      };

      currentGardenBedData.forEach((entry) => {
        Object.keys(averages).forEach((field) => {
          averages[field] += entry[field];
        });
      });
      Object.keys(averages).forEach((field) => {
        averages[field] /= newEntryCount;
      });

      const expectedResult = Object.assign(
        { bedId: bedId, entryCount: newEntryCount },
        averages
      );

      const currentGardenStatusData = getGardenStatusDataById(bedId);

      const result = calculateNewGardenStatusForBed(
        currentGardenStatusData,
        newGardenBedData
      );

      result.should.deep.equal(expectedResult);
    });
  });

  describe('getGardenStatusData', () => {
    it('should get garden status data for all beds', () => {
      const bedIds = Object.keys(bedToPumpConfig);
      const resultBedIds = [];

      getGardenStatusData().forEach((entry) => resultBedIds.push(entry.bedId));

      resultBedIds.should.deep.equal(bedIds);
    });
  });

  describe('getGardenStatusDataById', () => {
    it('should get garden status data for a bed', () => {
      const bedId = gardenBedData[0].bedId;

      const result = getGardenStatusDataById(bedId);

      result.bedId.should.be.a('string');
      result.airTemp.should.be.a('number');
      result.soilTemp.should.be.a('number');
      result.light.should.be.a('number');
      result.moisture.should.be.a('number');
      result.humidity.should.be.a('number');
      result.bedId.should.equal(bedId);
    });
  });

  describe('saveGardenStatusData', () => {
    it('should save garden status data for a new bed', () => {
      const newGardenStatusData = {
        bedId: 'Test_Bed',
        airTemp: 41.8,
        soilTemp: 43.2,
        light: 0.8,
        moisture: 0.2,
        humidity: 0.9,
        entryCount: 1,
      };

      const result = saveGardenStatusData(newGardenStatusData);

      result.message.should.be.a('string');
      result.message.should.equal(gardenStatusSaveSuccess);
    });
  });

  describe('updateGardenStatusData', () => {
    it('should update garden status data for a bed', () => {
      const bedId = gardenBedData[0].bedId;

      const newGardenStatusData = {
        bedId: bedId,
        airTemp: 41.8,
        soilTemp: 43.2,
        light: 0.8,
        moisture: 0.2,
        humidity: 0.9,
        entryCount: 1,
      };

      const result = updateGardenStatusData(bedId, newGardenStatusData);

      result.should.be.a('boolean');
      result.should.equal(true);
    });
  });
});
