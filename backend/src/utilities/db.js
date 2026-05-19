import sqlite from 'better-sqlite3';
import path from 'path';

const db = new sqlite(path.resolve('harvey.db'));

function query(sql, params) {
  return db.prepare(sql).all(params);
}

function run(sql, params) {
  return db.prepare(sql).run(params);
}

export default { query, run };
