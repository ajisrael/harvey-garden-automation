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
import serverConfig from '../../../src/config/serverConfig.js';

const should = chai.should();
chai.use(chaiHttp);

const url = '/api/v1/gardenBed/data';

const checkGardenBedData = (data, bedId = null) => {
  data.forEach((entry) => {
    entry.bedId.should.be.a('string');
    entry.id.should.be.a('number');
    entry.airTemp.should.be.a('number');
    entry.soilTemp.should.be.a('number');
    entry.light.should.be.a('number');
    entry.moisture.should.be.a('number');
    entry.humidity.should.be.a('number');
    entry.created_at.should.be.a('string');
    if (bedId) {
      entry.bedId.should.eql(bedId);
    }
  });
};

describe('gardenBedController & gardenBedRoutes', () => {
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
    it('should get all garden bed data', (done) => {
      const expectedLength = Math.min(
        gardenBedData.length,
        serverConfig.listPerPage
      );
      chai
        .request(server)
        .get(url)
        .set('Authorization', `Bearer ${getStandardUserToken()}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.data.should.be.a('array');
          res.body.data.length.should.be.eql(expectedLength);
          res.body.meta.should.be.a('object');
          res.body.meta.page.should.be.a('number');
          res.body.meta.page.should.be.eql(1);
          checkGardenBedData(res.body.data);
          done();
        });
    });
    it('should get garden bed data by ID', (done) => {
      const bedId = gardenBedData[0].bedId;
      const filteredGardenBedData = gardenBedData.filter((entry) => {
        return entry.bedId === bedId;
      });
      const expectedLength = Math.min(
        filteredGardenBedData.length,
        serverConfig.listPerPage
      );
      chai
        .request(server)
        .get(url)
        .set('Authorization', `Bearer ${getStandardUserToken()}`)
        .send({ bedId: gardenBedData[0].bedId })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.data.should.be.a('array');
          res.body.data.length.should.be.eql(expectedLength);
          res.body.meta.should.be.a('object');
          res.body.meta.page.should.be.a('number');
          res.body.meta.page.should.be.eql(1);
          checkGardenBedData(res.body.data, bedId);
          done();
        });
    });
  });

  describe(`POST ${url}`, () => {
    let gardenBedData = {
      bedId: 'Bed_3',
      airTemp: 34,
      soilTemp: 38,
      light: 0.5,
      moisture: 0.45,
      humidity: 0.6,
    };

    it('should save garden bed data', (done) => {
      chai
        .request(server)
        .post(url)
        .set('Authorization', `Bearer ${getStandardUserToken()}`)
        .send(gardenBedData)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });
});
