import sinon from 'sinon';
import { userTableName } from '../../src/constants/tableNames.js';
import db from '../../src/utilities/db.js';
import generateToken from '../../src/utilities/generateToken.js';

const getAdminUserToken = () => {
  const adminUserId = db.query(
    `SELECT id FROM ${userTableName} WHERE isAdmin = '1' LIMIT 1`,
    {}
  );
  return generateToken(adminUserId[0].id);
};

const getStandardUserToken = () => {
  const standardUserId = db.query(
    `SELECT id FROM ${userTableName} WHERE isAdmin = '0' LIMIT 1`,
    {}
  );
  return generateToken(standardUserId[0].id);
};

const restoreLogs = () => {
  console.log.restore();
  console.info.restore();
  console.warn.restore();
  console.error.restore();
};

const stubLogs = () => {
  sinon.stub(console, 'log'); // disable console.log
  sinon.stub(console, 'info'); // disable console.info
  sinon.stub(console, 'warn'); // disable console.warn
  sinon.stub(console, 'error'); // disable console.error
};

export { getAdminUserToken, getStandardUserToken, restoreLogs, stubLogs };
