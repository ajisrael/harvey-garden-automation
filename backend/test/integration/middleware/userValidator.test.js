import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../../../src/server.js';
import { resetDB } from '../../../src/seeder.js';
import {
  stubLogs,
  restoreLogs,
  getAdminUserToken,
} from '../../utilities/testHelper.js';
import serverConfig from '../../../src/config/serverConfig.js';
import { checkValidationResponse } from '../../utilities/dataChecker.js';
import { testUser } from '../../data/userTestData.js';

const should = chai.should();
chai.use(chaiHttp);

const url = '/api/v1/users';

describe('userValidator', () => {
  before((done) => {
    stubLogs();
    resetDB();
    done();
  });

  after((done) => {
    restoreLogs();
    done();
  });

  describe('validateLoginData', () => {
    it('should NOT login a user when body is empty', (done) => {
      chai
        .request(server)
        .post(`${url}/login`)
        .send({})
        .end((err, res) => {
          res.should.have.status(400);
          checkValidationResponse(res.body, 'body required for request');
          done();
        });
    });

    it('should NOT login a user when email is empty', (done) => {
      const loginUser = { password: testUser.password };
      chai
        .request(server)
        .post(`${url}/login`)
        .send(loginUser)
        .end((err, res) => {
          res.should.have.status(400);
          checkValidationResponse(res.body, 'email is empty');
          done();
        });
    });

    it('should NOT login a user when email is not a string', (done) => {
      const loginUser = { email: 1, password: testUser.password };
      chai
        .request(server)
        .post(`${url}/login`)
        .send(loginUser)
        .end((err, res) => {
          res.should.have.status(400);
          checkValidationResponse(res.body, 'email must be a string');
          done();
        });
    });

    it('should NOT login a user when password is empty', (done) => {
      const loginUser = { email: testUser.email };
      chai
        .request(server)
        .post(`${url}/login`)
        .send(loginUser)
        .end((err, res) => {
          res.should.have.status(400);
          checkValidationResponse(res.body, 'password is empty');
          done();
        });
    });

    it('should NOT login a user when password is not a string', (done) => {
      const loginUser = { email: testUser.email, password: 1 };
      chai
        .request(server)
        .post(`${url}/login`)
        .send(loginUser)
        .end((err, res) => {
          res.should.have.status(400);
          checkValidationResponse(res.body, 'password must be a string');
          done();
        });
    });
  });

  describe('validateRegistrationData', () => {
    it('should NOT register a new user when body is empty', (done) => {
      chai
        .request(server)
        .post(url)
        .set('Authorization', `Bearer ${getAdminUserToken()}`)
        .send({})
        .end((err, res) => {
          res.should.have.status(400);
          checkValidationResponse(res.body, 'body required for request');
          done();
        });
    });

    it('should NOT register a new user when missing name', (done) => {
      const registerUser = Object.assign({}, testUser);
      delete registerUser.name;
      chai
        .request(server)
        .post(url)
        .set('Authorization', `Bearer ${getAdminUserToken()}`)
        .send(registerUser)
        .end((err, res) => {
          res.should.have.status(400);
          checkValidationResponse(res.body, 'name is empty');
          done();
        });
    });

    it('should NOT register a new user when name is not a string', (done) => {
      const registerUser = Object.assign({}, testUser);
      delete registerUser.name;
      registerUser.name = 1;
      chai
        .request(server)
        .post(url)
        .set('Authorization', `Bearer ${getAdminUserToken()}`)
        .send(registerUser)
        .end((err, res) => {
          res.should.have.status(400);
          checkValidationResponse(res.body, 'name must be a string');
          done();
        });
    });

    it('should NOT register a new user when missing email', (done) => {
      const registerUser = Object.assign({}, testUser);
      delete registerUser.email;
      chai
        .request(server)
        .post(url)
        .set('Authorization', `Bearer ${getAdminUserToken()}`)
        .send(registerUser)
        .end((err, res) => {
          res.should.have.status(400);
          checkValidationResponse(res.body, 'email is empty');
          done();
        });
    });

    it('should NOT register a new user when email is not a string', (done) => {
      const registerUser = Object.assign({}, testUser);
      delete registerUser.email;
      registerUser.email = 1;
      chai
        .request(server)
        .post(url)
        .set('Authorization', `Bearer ${getAdminUserToken()}`)
        .send(registerUser)
        .end((err, res) => {
          res.should.have.status(400);
          checkValidationResponse(res.body, 'email must be a string');
          done();
        });
    });

    it('should NOT register a new user when email is not correctly formatted', (done) => {
      const registerUser = Object.assign({}, testUser);
      delete registerUser.email;
      registerUser.email = 'not a valid email';
      chai
        .request(server)
        .post(url)
        .set('Authorization', `Bearer ${getAdminUserToken()}`)
        .send(registerUser)
        .end((err, res) => {
          res.should.have.status(400);
          checkValidationResponse(res.body, 'email format is not valid');
          done();
        });
    });

    it('should NOT register a new user when missing password', (done) => {
      const registerUser = Object.assign({}, testUser);
      delete registerUser.password;
      chai
        .request(server)
        .post(url)
        .set('Authorization', `Bearer ${getAdminUserToken()}`)
        .send(registerUser)
        .end((err, res) => {
          res.should.have.status(400);
          checkValidationResponse(res.body, 'password is empty');
          done();
        });
    });

    it('should NOT register a new user when password is not a string', (done) => {
      const registerUser = Object.assign({}, testUser);
      delete registerUser.password;
      registerUser.password = 1;
      chai
        .request(server)
        .post(url)
        .set('Authorization', `Bearer ${getAdminUserToken()}`)
        .send(registerUser)
        .end((err, res) => {
          res.should.have.status(400);
          checkValidationResponse(res.body, 'password must be a string');
          done();
        });
    });

    it(`should NOT register a new user when password is less than ${serverConfig.passwordMinLength} characters`, (done) => {
      const registerUser = Object.assign({}, testUser);
      delete registerUser.password;
      registerUser.password = '1';
      chai
        .request(server)
        .post(url)
        .set('Authorization', `Bearer ${getAdminUserToken()}`)
        .send(registerUser)
        .end((err, res) => {
          res.should.have.status(400);
          checkValidationResponse(
            res.body,
            `password must be at least ${serverConfig.passwordMinLength} characters long`
          );
          done();
        });
    });
    it(`should NOT register a new user when password is more than ${serverConfig.passwordMaxLength} characters`, (done) => {
      const registerUser = Object.assign({}, testUser);
      delete registerUser.password;
      registerUser.password =
        '012345678901234567890123456789012345678901234567890123456789';
      chai
        .request(server)
        .post(url)
        .set('Authorization', `Bearer ${getAdminUserToken()}`)
        .send(registerUser)
        .end((err, res) => {
          res.should.have.status(400);
          checkValidationResponse(
            res.body,
            `password cannot be more than ${serverConfig.passwordMaxLength} characters long`
          );
          done();
        });
    });
  });
});
