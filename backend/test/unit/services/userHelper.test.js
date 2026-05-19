import chai from 'chai';
import { resetDB } from '../../../src/seeder.js';
import { stubLogs, restoreLogs } from '../../utilities/testHelper.js';
import { removeSqlFields } from '../../utilities/dataCleaner.js';
import {
  userSaveError,
  userSaveSuccess,
} from '../../../src/constants/messages.js';
import users from '../../../src/data/userData.js';
import {
  getUserData,
  getUserDataById,
  getUserDataByEmail,
  matchPassword,
  saveUserData,
  saveUserDataAndReturnUser,
  updateUserEmail,
  updateUserIsAdmin,
  updateUserName,
  updateUserPassword,
  isUserAdmin,
} from '../../../src/services/userHelper.js';
import { testUser } from '../../data/userTestData.js';

const should = chai.should();

describe('userHelper', () => {
  beforeEach((done) => {
    stubLogs();
    resetDB();
    done();
  });

  afterEach((done) => {
    restoreLogs();
    done();
  });

  describe('getUserData', () => {
    it('should get all user data', () => {
      const expectedData = [];
      users.forEach((entry) => {
        expectedData.push({
          name: entry.name,
          email: entry.email,
          isAdmin: entry.isAdmin,
        });
      });

      const resultRaw = getUserData();

      const result = removeSqlFields(resultRaw.data);

      result.should.be.a('array');
      result.should.eql(expectedData);
    });
  });

  describe('getUserDataById', () => {
    it('should get user data when passed an id', () => {
      const testData = getUserData().data[0];

      const expectedData = {};

      users.forEach((entry) => {
        if (entry.email === testData.email) {
          expectedData.name = entry.name;
          expectedData.email = entry.email;
          expectedData.isAdmin = entry.isAdmin;
        }
      });

      const result = getUserDataById(testData.id);
      delete result.id;

      result.should.be.a('object');
      result.should.eql(expectedData);
    });

    it('should NOT get user data when passed an invalid id', () => {
      const result = getUserDataById(-1);

      should.not.exist(result);
    });
  });

  describe('getUserDataByEmail', () => {
    it('should get user data when passed an email', () => {
      const testData = getUserData().data[0];

      const expectedData = {};

      users.forEach((entry) => {
        if (entry.email === testData.email) {
          expectedData.name = entry.name;
          expectedData.email = entry.email;
          expectedData.isAdmin = entry.isAdmin;
        }
      });

      const result = getUserDataByEmail(testData.email);
      delete result.id;

      result.should.be.a('object');
      result.should.eql(expectedData);
    });

    it('should NOT get user data when passed an invalid email', () => {
      const result = getUserDataById('Not an email');

      should.not.exist(result);
    });
  });

  describe('isUserAdmin', () => {
    it('should return true when a user is an admin', () => {
      const adminUsers = users.filter((entry) => {
        return entry.isAdmin !== 0;
      });
      const result = isUserAdmin(getUserDataByEmail(adminUsers[0].email));
      result.should.be.a('boolean');
      result.should.be.true;
    });

    it('should return false when a user is NOT an admin', () => {
      const nonAdminUsers = users.filter((entry) => {
        return entry.isAdmin === 0;
      });
      const result = isUserAdmin(getUserDataByEmail(nonAdminUsers[0].email));
      result.should.be.a('boolean');
      result.should.be.false;
    });
  });

  describe('matchPassword', () => {
    it("should match password of a user's email", () => {
      const result = matchPassword(users[0].email, users[0].password);

      result.should.be.a('boolean');
      result.should.be.true;
    });

    it("should NOT match password of a user's email when the password does not match", () => {
      const result = matchPassword(users[0].email, 'incorrect password');

      result.should.be.a('boolean');
      result.should.be.false;
    });
  });

  describe('saveUserData', () => {
    it('should get success message after saving user data', () => {
      const newUserData = Object.assign({ isAdmin: 0 }, testUser);

      const expectedMessage = userSaveSuccess;

      const result = saveUserData(newUserData);

      result.message.should.be.a('string');
      result.message.should.eql(expectedMessage);
    });

    it('should NOT get success message after saving user data with existing email', () => {
      const newUserData = Object.assign({ isAdmin: 0 }, testUser);
      newUserData.email = users[0].email;

      const expectedMessage = userSaveError;

      const result = saveUserData(newUserData);

      result.message.should.be.a('string');
      result.message.should.eql(expectedMessage);
    });
  });

  describe('saveUserDataAndReturnUser', () => {
    it('should return new saved user data without password', () => {
      const newUserData = Object.assign({ isAdmin: 0 }, testUser);

      const expectedData = {};
      expectedData.name = newUserData.name;
      expectedData.email = newUserData.email;
      expectedData.isAdmin = newUserData.isAdmin;

      const result = saveUserDataAndReturnUser(
        newUserData.name,
        newUserData.email,
        newUserData.password,
        newUserData.isAdmin
      );

      result.should.be.a('object');
      result.should.eql(expectedData);
    });

    it('should NOT return new saved user data without password when passed existing email', () => {
      const newUserData = Object.assign({ isAdmin: 0 }, testUser);
      newUserData.email = users[0].email;

      const expectedData = { message: userSaveError };

      const result = saveUserDataAndReturnUser(
        newUserData.name,
        newUserData.email,
        newUserData.password,
        newUserData.isAdmin
      );

      result.should.be.a('object');
      result.should.eql(expectedData);
    });
  });

  describe('updateUserEmail', () => {
    it('should return true after updating user email', () => {
      const testData = getUserData().data[0];

      const result = updateUserEmail(testData.id, 'newemail@example.com');

      result.should.be.a('boolean');
      result.should.be.true;
    });

    it('should return false when trying to update an email to an existing email', () => {
      const testData_0 = getUserData().data[0];
      const testData_1 = getUserData().data[1];

      const result = updateUserEmail(testData_0.id, testData_1.email);

      result.should.be.a('boolean');
      result.should.be.false;
    });
  });

  describe('updateUserIsAdmin', () => {
    it('should return true after updating user isAdmin', () => {
      const testData = getUserData().data[0];

      const result = updateUserIsAdmin(testData.id, 1);

      result.should.be.a('boolean');
      result.should.be.true;
    });
  });

  describe('updateUserName', () => {
    it('should return true after updating user name', () => {
      const testData = getUserData().data[0];

      const result = updateUserName(testData.id, 'newTestName');

      result.should.be.a('boolean');
      result.should.be.true;
    });
  });

  describe('updateUserPassword', () => {
    it('should return true after updating user password', () => {
      const testData = getUserData().data[0];

      const oldPassword = users.filter((entry) => {
        return entry.email === testData.email;
      })[0].password;

      const result = updateUserPassword(
        testData.email,
        oldPassword,
        'newPassword1234'
      );

      result.should.be.a('boolean');
      result.should.be.true;
    });

    it('should return false when failing to update password due to invalid old password', () => {
      const testData = getUserData().data[0];

      const result = updateUserPassword(
        testData.email,
        'badPassword1234',
        'newPassword1234'
      );

      result.should.be.a('boolean');
      result.should.be.false;
    });
  });
});
