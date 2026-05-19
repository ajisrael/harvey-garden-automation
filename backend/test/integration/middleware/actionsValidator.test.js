import { use, should as chaiShould } from 'chai';
import chaiHttp, { request } from 'chai-http';
import server from '../../../src/server.js';
import { resetDB } from '../../../src/seeder.js';
import {
  stubLogs,
  restoreLogs,
  getStandardUserToken,
} from '../../utilities/testHelper.js';
import actionData from '../../../src/data/actionData.js';
import { checkValidationResponse } from '../../utilities/dataChecker.js';

const should = chaiShould();
use(chaiHttp);

const url = '/api/v1/actions/data';

describe('actionsValidator', () => {
  before((done) => {
    stubLogs();
    resetDB();
    done();
  });

  after((done) => {
    restoreLogs();
    done();
  });

  describe('validateActionGet', () => {
    it('should NOT get an action when actionID is missing on a request with a body', (done) => {
      request.execute(server)
        .get(url)
        .set('Authorization', `Bearer ${getStandardUserToken()}`)
        .send({ notAnActionID: 'Not an action id' })
        .end((err, res) => {
          res.should.have.status(400);
          checkValidationResponse(res.body, 'actionId is empty');
          done();
        });
    });

    it('should NOT get an action when actionID is not a number', (done) => {
      request.execute(server)
        .get(url)
        .set('Authorization', `Bearer ${getStandardUserToken()}`)
        .send({ actionId: 'Not an action id' })
        .end((err, res) => {
          res.should.have.status(400);
          checkValidationResponse(res.body, 'actionId must be a number');
          done();
        });
    });
  });

  describe('validateActionPost', () => {
    it('should NOT post an action when body is empty', (done) => {
      request.execute(server)
        .post(url)
        .set('Authorization', `Bearer ${getStandardUserToken()}`)
        .send({})
        .end((err, res) => {
          res.should.have.status(400);
          checkValidationResponse(res.body, 'body required for request');
          done();
        });
    });

    it('should NOT post an action when bedIds is empty', (done) => {
      const newAction = Object.assign({}, actionData[0]);
      delete newAction.bedIds;
      request.execute(server)
        .post(url)
        .set('Authorization', `Bearer ${getStandardUserToken()}`)
        .send(newAction)
        .end((err, res) => {
          res.should.have.status(400);
          checkValidationResponse(res.body, 'bedIds is empty');
          done();
        });
    });

    it('should NOT post an action when bedIds is not an array', (done) => {
      const newAction = Object.assign({}, actionData[0]);
      delete newAction.bedIds;
      newAction.bedIds = 'Not an array';
      request.execute(server)
        .post(url)
        .set('Authorization', `Bearer ${getStandardUserToken()}`)
        .send(newAction)
        .end((err, res) => {
          res.should.have.status(400);
          checkValidationResponse(res.body, 'bedIds must be an array');
          done();
        });
    });

    it('should NOT post an action when bedIds is an empty array', (done) => {
      const newAction = Object.assign({}, actionData[0]);
      delete newAction.bedIds;
      newAction.bedIds = [];
      request.execute(server)
        .post(url)
        .set('Authorization', `Bearer ${getStandardUserToken()}`)
        .send(newAction)
        .end((err, res) => {
          res.should.have.status(400);
          checkValidationResponse(
            res.body,
            'bedIds must contain at least one bedId'
          );
          done();
        });
    });

    it('should NOT post an action when bedIds does not contain only strings', (done) => {
      const newAction = Object.assign({}, actionData[0]);
      delete newAction.bedIds;
      newAction.bedIds = [
        1,
        'element',
        'of',
        'this',
        'is',
        'not',
        'a',
        'string',
      ];
      request.execute(server)
        .post(url)
        .set('Authorization', `Bearer ${getStandardUserToken()}`)
        .send(newAction)
        .end((err, res) => {
          res.should.have.status(400);
          checkValidationResponse(
            res.body,
            'bedId in bedIds array must be a string'
          );
          done();
        });
    });

    it('should NOT post an action when actionCompleted is empty', (done) => {
      const newAction = Object.assign({}, actionData[0]);
      delete newAction.actionCompleted;
      request.execute(server)
        .post(url)
        .set('Authorization', `Bearer ${getStandardUserToken()}`)
        .send(newAction)
        .end((err, res) => {
          res.should.have.status(400);
          checkValidationResponse(res.body, 'actionCompleted is empty');
          done();
        });
    });

    it('should NOT post an action when actionCompleted is not a number', (done) => {
      const newAction = Object.assign({}, actionData[0]);
      delete newAction.actionCompleted;
      newAction.actionCompleted = 'not a number';
      request.execute(server)
        .post(url)
        .set('Authorization', `Bearer ${getStandardUserToken()}`)
        .send(newAction)
        .end((err, res) => {
          res.should.have.status(400);
          checkValidationResponse(res.body, 'actionCompleted must be a number');
          done();
        });
    });

    it('should NOT post an action when actionCompletedType is empty', (done) => {
      const newAction = Object.assign({}, actionData[0]);
      delete newAction.actionCompletedType;
      request.execute(server)
        .post(url)
        .set('Authorization', `Bearer ${getStandardUserToken()}`)
        .send(newAction)
        .end((err, res) => {
          res.should.have.status(400);
          checkValidationResponse(res.body, 'actionCompletedType is empty');
          done();
        });
    });

    it('should NOT post an action when actionCompletedType is not a string', (done) => {
      const newAction = Object.assign({}, actionData[0]);
      delete newAction.actionCompletedType;
      newAction.actionCompletedType = 1;
      request.execute(server)
        .post(url)
        .set('Authorization', `Bearer ${getStandardUserToken()}`)
        .send(newAction)
        .end((err, res) => {
          res.should.have.status(400);
          checkValidationResponse(
            res.body,
            'actionCompletedType must be a string'
          );
          done();
        });
    });

    it('should NOT post an action when actionName is empty', (done) => {
      const newAction = Object.assign({}, actionData[0]);
      delete newAction.actionName;
      request.execute(server)
        .post(url)
        .set('Authorization', `Bearer ${getStandardUserToken()}`)
        .send(newAction)
        .end((err, res) => {
          res.should.have.status(400);
          checkValidationResponse(res.body, 'actionName is empty');
          done();
        });
    });

    it('should NOT post an action when actionName is not a string', (done) => {
      const newAction = Object.assign({}, actionData[0]);
      delete newAction.actionName;
      newAction.actionName = 1;
      request.execute(server)
        .post(url)
        .set('Authorization', `Bearer ${getStandardUserToken()}`)
        .send(newAction)
        .end((err, res) => {
          res.should.have.status(400);
          checkValidationResponse(res.body, 'actionName must be a string');
          done();
        });
    });

    it('should NOT post an action when actionType is empty', (done) => {
      const newAction = Object.assign({}, actionData[0]);
      delete newAction.actionType;
      request.execute(server)
        .post(url)
        .set('Authorization', `Bearer ${getStandardUserToken()}`)
        .send(newAction)
        .end((err, res) => {
          res.should.have.status(400);
          checkValidationResponse(res.body, 'actionType is empty');
          done();
        });
    });

    it('should NOT post an action when actionType is not a string', (done) => {
      const newAction = Object.assign({}, actionData[0]);
      delete newAction.actionType;
      newAction.actionType = 1;
      request.execute(server)
        .post(url)
        .set('Authorization', `Bearer ${getStandardUserToken()}`)
        .send(newAction)
        .end((err, res) => {
          res.should.have.status(400);
          checkValidationResponse(res.body, 'actionType must be a string');
          done();
        });
    });
  });
});
