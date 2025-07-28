import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'

import { testConnection } from './config/database.js'
import { syncDatabase } from './config/sync.js'
import productRoutes from './routes/products.js'
import orderRoutes from './routes/orders.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 8080

app.use(helmet())
app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:5173', 'https://*.run.app'], credentials: true }))
app.use(morgan('combined'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
    res.json({ 
        message: 'API de Panadería funcionando correctamente',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        port: PORT
    })
})

app.get('/health', (req, res) => {
    res.json({ status: 'OK', uptime: process.uptime(), timestamp: new Date().toISOString() })
})

app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)

app.use((req, res, next) => {
    res.status(404).json({ error: 'Ruta no encontrada', path: req.originalUrl })
})

app.use((error, req, res, next) => {
    console.error('Error:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
})

async function initializeServer() {
    console.log(`🚀 Iniciando aplicación en puerto ${PORT}`)
    console.log(`🌍 Entorno: ${process.env.NODE_ENV}`)
    console.log(`🗄️ DB Host: ${process.env.DB_HOST}`)
    console.log(`👤 DB User: ${process.env.DB_USER}`)
    
    const connectionSuccessful = await testConnection()
    if (connectionSuccessful) {
        await syncDatabase(true)
    } else {
        console.log('⚠️ Continuando sin base de datos')
    }
    
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`✅ Servidor funcionando en puerto ${PORT}`)
    })
}

initializeServer()
