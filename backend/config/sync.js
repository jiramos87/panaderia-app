import { sequelize } from './database.js'
import { Product, Order, OrderProduct } from '../models/associations.js'

async function syncDatabase(force = true) {
  try {
    console.log('🔄 Iniciando sincronización de base de datos...')
    
    await sequelize.sync({ force })
    
    if (force) {
      console.log('⚠️  Base de datos recreada desde cero')
      await seedInitialData()
    } else {
      // Verificar si necesitamos datos iniciales
      const productCount = await Product.count()
      if (productCount === 0) {
        console.log('📋 Base de datos vacía, agregando datos iniciales...')
        await seedInitialData()
      } else {
        console.log('✅ Base de datos sincronizada correctamente')
      }
    }
    
    return true
  } catch (error) {
    console.error('❌ Error sincronizando base de datos:', error.message)
    return false
  }
}

async function seedInitialData() {
  try {
    console.log('🌱 Agregando datos iniciales...')

    await Product.bulkCreate([
      {
        name: 'Baguette Tradicional',
        price: 1200.00,
        description: 'Pan francés crujiente, perfecto para acompañar comidas',
        active: true
      },
      {
        name: 'Croissant de Mantequilla',
        price: 1500.00,
        description: 'Hojaldre dorado y mantecoso, ideal para el desayuno',
        active: true
      },
      {
        name: 'Pan Integral',
        price: 1800.00,
        description: 'Pan nutritivo con granos integrales y semillas',
        active: true
      },
      {
        name: 'Torta de Chocolate',
        price: 8500.00,
        description: 'Deliciosa torta de chocolate con cobertura de ganache',
        active: true
      }
    ])
    
    console.log('✅ Datos iniciales agregados correctamente')
  } catch (error) {
    console.error('❌ Error agregando datos iniciales:', error.message)
  }
}

export { syncDatabase }
