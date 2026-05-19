import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../../../src/server.js';
import { resetDB } from '../../../src/seeder.js';
import {
  stubLogs,
  restoreLogs,
  getAdminUserToken,
  getStandardUserToken,
} from '../../utilities/testHelper.js';
import users from '../../../src/data/userData.js';
import {
  checkNewlyRegisteredUserData,
  checkUsersData,
} from '../../utilities/dataChecker.js';
import { testUser } from '../../data/userTestData.js';

const should = chai.should();
chai.use(chaiHttp);

const url = '/api/v1/users';

describe('userController & userRoutes', () => {
  before((done) => {
    stubLogs();
    resetDB();
    done();
  });

  after((done) => {
    restoreLogs();
    done();
  });

  let standardUser = {};
  let adminUser = {};

  describe(`POST ${url}/login`, () => {
    it('should login a standard user', (done) => {
      const standardUsers = users.filter((entry) => {
        return entry.isAdmin === 0;
      });
      standardUser = standardUsers[0];
      const email = standardUser.email;
      const password = standardUser.password;

      chai
        .request(server)
        .post(`${url}/login`)
        .send({ email, password })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.isAdmin.should.be.false;
          checkUsersData(res.body, standardUser.name, standardUser.email);
          standardUser.token = res.body.token;
          done();
        });
    });

    it('should login an admin user', (done) => {
      const adminUsers = users.filter((entry) => {
        return entry.isAdmin !== 0;
      });

      chai
        .request(server)
        .post(`${url}/login`)
        .send({ email: adminUsers[0].email, password: adminUsers[0].password })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.isAdmin.should.be.true;
          checkUsersData(res.body, adminUsers[0].name, adminUsers[0].email);
          done();
        });
    });
  });

  describe(`POST ${url}`, () => {
    it('should register a new user when logged in as admin', (done) => {
      chai
        .request(server)
        .post(url)
        .set('Authorization', `Bearer ${getAdminUserToken()}`)
        .send(testUser)
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.a('object');
          checkNewlyRegisteredUserData(res.body, testUser);
          done();
        });
    });

    it('should NOT register a new user when logged in as a standard user', (done) => {
      chai
        .request(server)
        .post(url)
        .set('Authorization', `Bearer ${getStandardUserToken()}`)
        .send(testUser)
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.be.a('object');
          res.body.message.should.be.a('string');
          res.body.stack.should.be.a('string');
          res.body.message.should.eql('Not authorized, not an admin');
          done();
        });
    });

    it('should NOT register a new user user already exists', (done) => {
      const existingUser = Object.assign({}, users[0]);
      delete existingUser.isAdmin;
      chai
        .request(server)
        .post(url)
        .set('Authorization', `Bearer ${getAdminUserToken()}`)
        .send(existingUser)
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.be.a('object');
          res.body.message.should.be.a('string');
          res.body.stack.should.be.a('string');
          res.body.message.should.eql('User already exists');
          done();
        });
    });
  });
});
