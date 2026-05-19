import chai from 'chai';
import { resetDB } from '../../../src/seeder.js';
import { stubLogs, restoreLogs } from '../../utilities/testHelper.js';
import pumpStateData from '../../../src/data/pumpStateData.js';
import { Reservoir_0 } from '../../../src/constants/componentIds.js';
import {
  activatePump,
  deactivatePump,
  getPumpStateData,
  getPumpStateDataById,
  isPumpActive,
  savePumpStateData,
} from '../../../src/services/pumpHelper.js';
import {
  pumpSaveError,
  pumpSaveSuccess,
} from '../../../src/constants/messages.js';
import { removeSqlFields } from '../../utilities/dataCleaner.js';

const should = chai.should();

describe('pumpHelper', () => {
  beforeEach((done) => {
    stubLogs();
    resetDB();
    done();
  });

  afterEach((done) => {
    restoreLogs();
    done();
  });

  describe('activatePump', () => {
    beforeEach(() => {
      deactivatePump(Reservoir_0);
    });
    it('should activate a pump', () => {
      const pumpActivated = activatePump(Reservoir_0);
      pumpActivated.should.be.a('boolean');
      pumpActivated.should.be.eql(true);
    });
    it('should NOT activate pump when passed an invalid pumpId', () => {
      const pumpActivated = activatePump('Not A Pump ID');
      pumpActivated.should.be.a('boolean');
      pumpActivated.should.be.eql(false);
    });
  });

  describe('deactivatePump', () => {
    beforeEach(() => {
      activatePump(Reservoir_0);
    });
    it('should deactivate a pump', () => {
      const result = deactivatePump(Reservoir_0);
      result.should.be.a('boolean');
      result.should.be.eql(true);
    });
    it('should NOT deactivate pump when passed an invalid pumpId', () => {
      const result = deactivatePump('Not A Pump ID');
      result.should.be.a('boolean');
      result.should.be.eql(false);
    });
  });

  describe('getPumpStateData', () => {
    it('should get all pumpState data', () => {
      const expectedData = pumpStateData;
      const resultRaw = getPumpStateData();

      const result = removeSqlFields(resultRaw.data);

      result.should.be.a('array');
      result.should.eql(expectedData);
    });
  });

  describe('getPumpStateDataById', () => {
    it('should get pumpState data', () => {
      const expectedData = pumpStateData.filter((entry) => {
        return entry.componentId == Reservoir_0;
      });

      const resultRaw = getPumpStateDataById(Reservoir_0);
      const result = removeSqlFields(resultRaw.data);

      result.should.be.a('array');
      result.should.eql(expectedData);
    });

    it('should get empty array of pumpState data when passed an invalid pumpId', () => {
      const expectedData = [];

      const result = getPumpStateDataById('Not A Pump ID').data;

      result.should.be.a('array');
      result.should.eql(expectedData);
    });
  });

  describe('isPumpActive', () => {
    it('should get active pump state after activating pump', () => {
      activatePump(Reservoir_0);

      const result = isPumpActive(Reservoir_0);

      result.should.be.a('boolean');
      result.should.eql(true);
    });

    it('should get inactive pump state after deactivating pump', () => {
      deactivatePump(Reservoir_0);

      const result = isPumpActive(Reservoir_0);

      result.should.be.a('boolean');
      result.should.eql(false);
    });
  });

  describe('savePumpStateData', () => {
    it('should get success message after saving pump state data', () => {
      const newPumpStateData = {
        componentId: 'Reservoir_1',
        pumpState: 0,
        entryActive: 1,
      };

      const expectedMessage = pumpSaveSuccess;

      const result = savePumpStateData(newPumpStateData);

      result.message.should.be.a('string');
      result.message.should.eql(expectedMessage);
    });

    it('should NOT get success message after saving pump state data with existing pumpId', () => {
      const newPumpStateData = {
        componentId: Reservoir_0,
        pumpState: 0,
        entryActive: 1,
      };

      const expectedMessage = pumpSaveError;

      const result = savePumpStateData(newPumpStateData);

      result.message.should.be.a('string');
      result.message.should.eql(expectedMessage);
    });
  });
});
