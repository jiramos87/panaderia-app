import { Sequelize } from 'sequelize'
import dotenv from 'dotenv'

dotenv.config()

const DB_USER = process.env.DB_USER
const DB_PASSWORD = process.env.DB_PASSWORD
const DB_NAME = process.env.DB_NAME
const DB_HOST = process.env.DB_HOST
const DB_PORT = process.env.DB_PORT || 5432
const DB_DIALECT = process.env.DB_DIALECT || 'postgres'

console.log('DB Config:', { user: DB_USER, name: DB_NAME, host: DB_HOST?.substring(0, 20) + '...', passwordSet: !!DB_PASSWORD })

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: DB_DIALECT,
  pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' && DB_HOST?.includes('cloudsql') ? {
      require: true,
      rejectUnauthorized: false
    } : false
  },
  timezone: '-03:00'
})

async function testConnection() {
  try {
    await sequelize.authenticate()
    console.log('✅ Conexión a PostgreSQL establecida')
    return true
  } catch (error) {
    console.error('❌ Error conectando a PostgreSQL:', error.message)
    return false
  }
}

export { sequelize, testConnection }
