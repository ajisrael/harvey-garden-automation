import bcrypt from 'bcryptjs';
import db from '../utilities/db.js';
import { userTableName } from '../constants/tableNames.js';
import { userSaveError, userSaveSuccess } from '../constants/messages.js';

const queryParams = 'id, name, email, isAdmin';

function createUserTable() {
  return db.run(
    `CREATE TABLE ${userTableName}( ` +
      'id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
      'name TEXT, ' +
      'email TEXT UNIQUE, ' +
      'password BLOB, ' +
      'isAdmin INTEGER, ' +
      'created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL ' +
      '); ',
    {}
  );
}

function deleteUserData() {
  return db.run(`DELETE FROM ${userTableName};`, {});
}

function getUserData() {
  const data = db.query(`SELECT ${queryParams} FROM ${userTableName}`, {});

  return {
    data,
  };
}

function getUserDataById(id) {
  const data = db.query(
    `SELECT ${queryParams} FROM ${userTableName} WHERE id = '${id}' LIMIT 1`,
    {}
  );

  return data[0];
}

function getUserDataByEmail(email) {
  const data = db.query(
    `SELECT ${queryParams} FROM ${userTableName} WHERE email = '${email}' LIMIT 1`,
    {}
  );

  return data[0];
}

function getPasswordByEmail(email) {
  const data = db.query(
    `SELECT password FROM ${userTableName} WHERE email = '${email}' LIMIT 1`,
    {}
  );

  return data[0];
}

function isUserAdmin(user) {
  return user.isAdmin !== 0;
}

function matchPassword(email, password) {
  return bcrypt.compareSync(password, getPasswordByEmail(email).password);
}

function saveUserData(userData) {
  const { name, email, password, isAdmin } = userData;

  const passwordHash = bcrypt.hashSync(password, 10);

  let message = userSaveError;

  try {
    const result = db.run(
      `INSERT INTO ${userTableName} (name, email, password, isAdmin) VALUES (@name, @email, @passwordHash, @isAdmin)`,
      { name, email, passwordHash, isAdmin }
    );

    if (result.changes) {
      message = userSaveSuccess;
    }
  } catch (error) {
    if (error.message !== 'UNIQUE constraint failed: user.email') {
      throw new Error(error.message);
    }
  }

  return { message };
}

function saveUserDataAndReturnUser(name, email, password, isAdmin = 0) {
  const userData = { name, email, password, isAdmin };
  const resp = saveUserData(userData);

  delete userData.password;

  if (resp.message === userSaveError) {
    return resp;
  }

  return userData;
}

function updateUserEmail(id, email) {
  try {
    const result = db.run(
      `UPDATE ${userTableName} SET email = '${email}' WHERE id = '${id}';`,
      {}
    );

    console.log('email update result', result);

    return result.changes !== 0;
  } catch (error) {
    if (error.message !== 'UNIQUE constraint failed: user.email') {
      throw new Error(error.message);
    } else {
      return false;
    }
  }
}

function updateUserIsAdmin(id, isAdmin) {
  const result = db.run(
    `UPDATE ${userTableName} SET isAdmin = '${isAdmin}' WHERE id = '${id}';`,
    {}
  );

  return result.changes !== 0;
}

function updateUserName(id, name) {
  const result = db.run(
    `UPDATE ${userTableName} SET name = '${name}' WHERE id = '${id}';`,
    {}
  );

  return result.changes !== 0;
}

function updateUserPassword(email, oldPassword, newPassword) {
  if (matchPassword(email, oldPassword)) {
    const result = db.run(
      `UPDATE ${userTableName} SET password = '${newPassword}' WHERE email = '${email}';`,
      {}
    );
    return result.changes !== 0;
  } else {
    console.log(`Passwords did not match for ${email}.`);
    return false;
  }
}

export {
  createUserTable,
  deleteUserData,
  getUserData,
  getUserDataById,
  getUserDataByEmail,
  isUserAdmin,
  matchPassword,
  saveUserData,
  saveUserDataAndReturnUser,
  updateUserEmail,
  updateUserIsAdmin,
  updateUserName,
  updateUserPassword,
};
