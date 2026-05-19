import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../../../src/server.js';
import { resetDB } from '../../../src/seeder.js';
import {
  stubLogs,
  restoreLogs,
  getStandardUserToken,
} from '../../utilities/testHelper.js';
import { checkValidationResponse } from '../../utilities/dataChecker.js';
import generateToken from '../../../src/utilities/generateToken.js';

const should = chai.should();
chai.use(chaiHttp);

const url = '/api/v1/actions/data';

describe('authMiddleware', () => {
  before((done) => {
    stubLogs();
    resetDB();
    done();
  });

  after((done) => {
    restoreLogs();
    done();
  });

  describe('protect', () => {
    it(`should STOP a request when missing a token`, (done) => {
      chai
        .request(server)
        .get(url)
        .send()
        .end((err, res) => {
          res.should.have.status(401);
          checkValidationResponse(res.body, 'Not authorized, no token');
          done();
        });
    });
    it(`should STOP a request when using an incorrectly formatted token`, (done) => {
      chai
        .request(server)
        .get(url)
        .set('Authorization', 'Bearer incorrectlyFormattedToken')
        .send()
        .end((err, res) => {
          res.should.have.status(401);
          checkValidationResponse(res.body, 'Not authorized, token failed');
          done();
        });
    });
    it(`should STOP a request when using an invalid token`, (done) => {
      chai
        .request(server)
        .get(url)
        .set('Authorization', `Bearer ${generateToken('notAnId')}`)
        .send()
        .end((err, res) => {
          res.should.have.status(401);
          checkValidationResponse(
            res.body,
            'Unable to find user, token failed'
          );
          done();
        });
    });
  });

  describe('admin', () => {
    it(`should STOP a request when user is not an admin`, (done) => {
      chai
        .request(server)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${getStandardUserToken()}`)
        .send()
        .end((err, res) => {
          res.should.have.status(401);
          checkValidationResponse(res.body, 'Not authorized, not an admin');
          done();
        });
    });
  });
});
