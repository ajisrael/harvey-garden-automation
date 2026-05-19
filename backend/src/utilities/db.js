import sqlite from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(process.env.DB_PATH || 'harvey.db');
const db = new sqlite(dbPath);

function query(sql, params) {
  return Array.isArray(params)
    ? db.prepare(sql).all(...params)
    : db.prepare(sql).all(params);
}

function run(sql, params) {
  return Array.isArray(params)
    ? db.prepare(sql).run(...params)
    : db.prepare(sql).run(params);
}

export default { query, run };
