import chai from 'chai';
import { resetDB } from '../../../src/seeder.js';
import { stubLogs, restoreLogs } from '../../utilities/testHelper.js';
import solenoidStateData from '../../../src/data/solenoidStateData.js';
import { Bed_0 } from '../../../src/constants/componentIds.js';
import {
  activateSolenoid,
  deactivateSolenoid,
  getSolenoidStateData,
  getSolenoidStateDataById,
  isSolenoidActive,
  saveSolenoidStateData,
} from '../../../src/services/solenoidHelper.js';
import {
  solenoidSaveError,
  solenoidSaveSuccess,
} from '../../../src/constants/messages.js';
import { removeSqlFields } from '../../utilities/dataCleaner.js';

const should = chai.should();

describe('solenoidHelper', () => {
  beforeEach((done) => {
    stubLogs();
    resetDB();
    done();
  });

  afterEach((done) => {
    restoreLogs();
    done();
  });

  describe('activateSolenoid', () => {
    beforeEach(() => {
      deactivateSolenoid(Bed_0);
    });
    it('should activate a solenoid', () => {
      const solenoidActivated = activateSolenoid(Bed_0);
      solenoidActivated.should.be.a('boolean');
      solenoidActivated.should.be.eql(true);
    });
    it('should NOT activate solenoid when passed an invalid solenoidId', () => {
      const solenoidActivated = activateSolenoid('Not A Solenoid ID');
      solenoidActivated.should.be.a('boolean');
      solenoidActivated.should.be.eql(false);
    });
  });

  describe('deactivateSolenoid', () => {
    beforeEach(() => {
      activateSolenoid(Bed_0);
    });
    it('should deactivate a solenoid', () => {
      const result = deactivateSolenoid(Bed_0);
      result.should.be.a('boolean');
      result.should.be.eql(true);
    });
    it('should NOT deactivate solenoid when passed an invalid solenoidId', () => {
      const result = deactivateSolenoid('Not A Solenoid ID');
      result.should.be.a('boolean');
      result.should.be.eql(false);
    });
  });

  describe('getSolenoidStateData', () => {
    it('should get all solenoidState data', () => {
      const expectedData = solenoidStateData;
      const resultRaw = getSolenoidStateData();

      const result = removeSqlFields(resultRaw.data);

      result.should.be.a('array');
      result.should.eql(expectedData);
    });
  });

  describe('getSolenoidStateDataById', () => {
    it('should get solenoidState data', () => {
      const expectedData = solenoidStateData.filter((entry) => {
        return entry.componentId == Bed_0;
      });

      const resultRaw = getSolenoidStateDataById(Bed_0);
      const result = removeSqlFields(resultRaw.data);

      result.should.be.a('array');
      result.should.eql(expectedData);
    });

    it('should get empty array of solenoidState data when passed an invalid solenoidId', () => {
      const expectedData = [];

      const result = getSolenoidStateDataById('Not A Solenoid ID').data;

      result.should.be.a('array');
      result.should.eql(expectedData);
    });
  });

  describe('isSolenoidActive', () => {
    it('should get active solenoid state after activating solenoid', () => {
      activateSolenoid(Bed_0);

      const result = isSolenoidActive(Bed_0);

      result.should.be.a('boolean');
      result.should.eql(true);
    });

    it('should get inactive solenoid state after deactivating solenoid', () => {
      deactivateSolenoid(Bed_0);

      const result = isSolenoidActive(Bed_0);

      result.should.be.a('boolean');
      result.should.eql(false);
    });
  });

  describe('saveSolenoidStateData', () => {
    it('should get success message after saving solenoid state data', () => {
      const newSolenoidStateData = {
        componentId: 'New_Bed_1',
        solenoidState: 0,
        entryActive: 1,
      };

      const expectedMessage = solenoidSaveSuccess;

      const result = saveSolenoidStateData(newSolenoidStateData);

      result.message.should.be.a('string');
      result.message.should.eql(expectedMessage);
    });

    it('should NOT get success message after saving solenoid state data with existing solenoidId', () => {
      const newSolenoidStateData = {
        componentId: Bed_0,
        solenoidState: 0,
        entryActive: 1,
      };

      const expectedMessage = solenoidSaveError;

      const result = saveSolenoidStateData(newSolenoidStateData);

      result.message.should.be.a('string');
      result.message.should.eql(expectedMessage);
    });
  });
});
