const sql = require('mssql');

const config = {
  server: 'localhost',
  user: 'sa',
  password: '<Sang_123456>',
  database: 'qldiem_KienTruc2',
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};


class Database {
  constructor() {
    this.pool = null;
  }
  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
  async connect() {
    try {
      this.pool = await sql.connect(config);
      console.log('Connected to the database');
    } catch (error) {
      console.log('Database connection error:', error);
    }
  }

  async disconnect() {
    try {
      await this.pool.close();
      console.log('Disconnected from the database');
    } catch (error) {
      console.log('Database disconnection error:', error);
    }
  }

  async executeQuery(query) {
    try {
      const result = await this.pool.request().query(query);
      return result.recordset;
    } catch (error) {
      console.log('Database query error:', error);
      throw error;
    }
  }
}

module.exports = Database;

