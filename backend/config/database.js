import { Sequelize } from 'sequelize'
import dotenv from 'dotenv'

dotenv.config()

const databaseConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  dialect: process.env.DB_DIALECT,
  
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  
  logging: process.env.NODE_ENV === 'development' ? console.log : false,

  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' && process.env.DB_HOST !== 'postgres' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  },
  
  timezone: '-03:00'
}

const sequelize = new Sequelize(
  databaseConfig.database,
  databaseConfig.username,
  databaseConfig.password,
  databaseConfig
)

async function testConnection() {
  try {
    await sequelize.authenticate()
    console.log('✅ Conexión a PostgreSQL establecida correctamente')
    return true
  } catch (error) {
    console.error('❌ No se pudo conectar a PostgreSQL:', error.message)
    return false
  }
}

export {
  sequelize,
  testConnection
}
