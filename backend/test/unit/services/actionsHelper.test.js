import { equal } from 'assert';
import chai from 'chai';
import { resetDB } from '../../../src/seeder.js';
import { stubLogs, restoreLogs } from '../../utilities/testHelper.js';
import actionData from '../../../src/data/actionData.js';
import { actionsSaveSuccess } from '../../../src/constants/messages.js';
import {
  getActionData,
  getActionDataById,
  saveActionData,
} from '../../../src/services/actionsHelper.js';
import serverConfig from '../../../src/config/serverConfig.js';

const should = chai.should();

describe('actionsHelper', () => {
  beforeEach((done) => {
    stubLogs();
    resetDB();
    done();
  });

  afterEach((done) => {
    restoreLogs();
    done();
  });

  describe('getActionData', () => {
    it('should return a page of action data', () => {
      const result = getActionData();
      const expectedData =
        actionData.length < serverConfig.listPerPage
          ? actionData
          : actionData.slice(0, serverConfig.listPerPage - 1);

      equal(result.data.length, expectedData.length);

      for (let i = 0; i < result.data.length; i++) {
        for (let j = 0; j < result.data[i].bedIds.length; j++) {
          equal(result.data[i].bedIds[j], expectedData[i].bedIds[j]);
        }
        equal(result.data[i].actionName, expectedData[i].actionName);
        equal(result.data[i].actionType, expectedData[i].actionType);
        equal(
          result.data[i].actionCompletedType,
          expectedData[i].actionCompletedType
        );
        equal(result.data[i].actionCompleted, expectedData[i].actionCompleted);
      }
    });
  });

  describe('getActionDataById', () => {
    it('should return an action based on its id', () => {
      const actionDataFromDB = getActionData();
      const result = getActionDataById(actionDataFromDB.data[0].id);

      const expectedData = actionData.filter((entry) => {
        return entry.actionCompleted === result.actionCompleted;
      })[0];

      for (let i = 0; i < result.bedIds.length; i++) {
        equal(result.bedIds[i], expectedData.bedIds[i]);
      }
      equal(result.actionName, expectedData.actionName);
      equal(result.actionType, expectedData.actionType);
      equal(result.actionCompletedType, expectedData.actionCompletedType);
      equal(result.actionCompleted, expectedData.actionCompleted);
    });
  });

  describe('saveActionData', () => {
    it('should get success message after saving action data', () => {
      const newActionData = {
        bedIds: ['Bed_2', 'Bed_3'],
        actionType: 'Water',
        actionCompletedType: 'Time',
        actionCompleted: 60,
      };

      const message = actionsSaveSuccess;

      equal(saveActionData(newActionData).message, message);
    });
  });
});
