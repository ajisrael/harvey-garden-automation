import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../../../src/server.js';
import { resetDB } from '../../../src/seeder.js';
import {
  stubLogs,
  restoreLogs,
  getStandardUserToken,
} from '../../utilities/testHelper.js';
import gardenBedData from '../../../src/data/gardenBedData.js';

const should = chai.should();
chai.use(chaiHttp);

const url = '/api/v1/gardenStatus/data';

const checkGardenStatusData = (data, bedId = null) => {
  data.airTemp.should.be.a('number');
  data.soilTemp.should.be.a('number');
  data.light.should.be.a('number');
  data.moisture.should.be.a('number');
  data.humidity.should.be.a('number');
  if (bedId) {
    data.bedId.should.be.a('string');
    data.bedId.should.eql(bedId);
    data.entryCount.should.be.a('number');
  }
};

describe('gardenStatusController & gardenStatusRoutes', () => {
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
    it('should get overall garden status', (done) => {
      chai
        .request(server)
        .get(url)
        .set('Authorization', `Bearer ${getStandardUserToken()}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          checkGardenStatusData(res.body);
          done();
        });
    });
    it('should get garden status data by ID', (done) => {
      const bedId = gardenBedData[0].bedId;
      chai
        .request(server)
        .get(url)
        .set('Authorization', `Bearer ${getStandardUserToken()}`)
        .send({ bedId: gardenBedData[0].bedId })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          checkGardenStatusData(res.body, bedId);
          done();
        });
    });
  });
});
