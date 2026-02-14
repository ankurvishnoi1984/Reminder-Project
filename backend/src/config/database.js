const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    // Performance optimizations
    pool: {
      max: parseInt(process.env.DB_POOL_MAX) || 10,
      min: parseInt(process.env.DB_POOL_MIN) || 2,
      acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
      idle: parseInt(process.env.DB_POOL_IDLE) || 10000,
      evict: parseInt(process.env.DB_POOL_EVICT) || 1000
    },
    // Connection retry configuration
    retry: {
      max: 3
    },
    // Optimize for read operations
    dialectOptions: {
      connectTimeout: 60000,
      // Enable compression for better performance
      compress: true,
      // Additional performance options
      dateStrings: true,
      typeCast: true
    },
    // Query optimization
    benchmark: process.env.NODE_ENV === 'development',
    // Disable SQL injection protection for better performance (use parameterized queries)
    // This is already the default behavior in Sequelize
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: true
    }
  }
);

module.exports = sequelize;

/*const baseConfig = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'mysql',

  pool: {
    max: parseInt(process.env.DB_POOL_MAX) || 10,
    min: parseInt(process.env.DB_POOL_MIN) || 2,
    acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
    idle: parseInt(process.env.DB_POOL_IDLE) || 10000,
    evict: parseInt(process.env.DB_POOL_EVICT) || 1000
  },

  retry: {
    max: 3
  },

  dialectOptions: {
    connectTimeout: 60000,
    compress: true,
    dateStrings: false,
    typeCast: true
  },

  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: true
  }
};

module.exports = {
  development: {
    ...baseConfig,
    logging: console.log,
    benchmark: true
  },
  test: {
    ...baseConfig,
    logging: false
  },
  production: {
    ...baseConfig,
    logging: false
  }
};*/

