import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'

import { testConnection } from './config/database.js'
import { syncDatabase } from './config/sync.js'


dotenv.config()

const app = express()

const PORT = process.env.PORT || 3001

app.use(helmet())

app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true
}))

app.use(morgan('combined'))


app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
    res.json({ 
        message: 'API de Panadería funcionando correctamente',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV 
    })
})

app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    })
})

app.use((req, res, next) => {
  res.status(404).json({
      error: 'Ruta no encontrada',
      path: req.originalUrl,
      method: req.method
  })
})

app.use((error, req, res, next) => {
    console.error('Error capturado:', error);
    res.status(500).json({
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Algo salió mal'
    })
})

async function initializeServer() {
  console.log('🚀 Iniciando aplicación de panadería...')
  
  const connectionSuccessful = await testConnection()
  if (!connectionSuccessful) {
    console.log('❌ No se pudo conectar a la base de datos. Cerrando servidor...')
    process.exit(1)
  }
  
  const isDevelopment = process.env.NODE_ENV === 'development'
  const syncSuccessful = await syncDatabase(isDevelopment)
  
  if (!syncSuccessful) {
    console.log('❌ No se pudo sincronizar la base de datos. Cerrando servidor...')
    process.exit(1)
  }

  app.listen(PORT, () => {
    console.log('🎉 ¡Aplicación iniciada exitosamente!')
    console.log(`🌐 Servidor: http://localhost:${PORT}`)
    console.log(`📊 Entorno: ${process.env.NODE_ENV}`)
    console.log(`💾 Base de datos: Conectada y sincronizada`)
    console.log('📋 Para detener el servidor presiona Ctrl+C')
  })
}

initializeServer()
