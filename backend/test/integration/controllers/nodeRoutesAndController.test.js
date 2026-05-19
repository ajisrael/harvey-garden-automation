import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../../../src/server.js';
import { resetDB } from '../../../src/seeder.js';
import {
  stubLogs,
  restoreLogs,
  getStandardUserToken,
} from '../../utilities/testHelper.js';
import nodeConfig from '../../../src/config/nodeConfig.js';

const should = chai.should();
chai.use(chaiHttp);

const url = '/api/v1/node/:nodeId/config';

const checkGardenNodeData = (data, nodeId = null) => {
  Object.keys(data).forEach((field) => {
    data[field].should.be.a('number');
    if (nodeId) {
      data[field].should.eql(nodeConfig[nodeId][field]);
    }
  });
};

describe('Node Controller and Routes', () => {
  before((done) => {
    stubLogs();
    resetDB();
    done();
  });

  after((done) => {
    restoreLogs();
    done();
  });

  describe(`GET ${url}`, () => {
    Object.keys(nodeConfig).forEach((nodeId) => {
      it(`should get node config for id: ${nodeId}`, (done) => {
        chai
          .request(server)
          .get(url.replace(':nodeId', nodeId))
          .set('Authorization', `Bearer ${getStandardUserToken()}`)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            checkGardenNodeData(res.body);
            done();
          });
      });
    });
  });
});
