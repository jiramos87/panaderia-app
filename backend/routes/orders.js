import express from 'express'
import { sequelize } from '../config/database.js'
import Order from '../models/Order.js'
import Product from '../models/Product.js'
import OrderProduct from '../models/OrderProduct.js'

const router = express.Router()

// POST /api/orders - Crear nuevo pedido
router.post('/', async (req, res) => {
  const transaction = await sequelize.transaction()
  
  try {
    const { customer_name, customer_email, products } = req.body

    let total_amount = 0
    const productData = []
    
    for (const item of products) {
      const product = await Product.findByPk(item.product_id)
      if (!product || !product.active) {
        await transaction.rollback()
        return res.status(400).json({
          success: false,
          message: `Producto con ID ${item.product_id} no encontrado o inactivo`
        })
      }
      
      const subtotal = parseFloat(product.price) * item.quantity
      total_amount += subtotal
      
      productData.push({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: product.price,
        subtotal: subtotal
      })
    }
    
    const order = await Order.create({
      customer_name,
      customer_email,
      total_amount: total_amount.toFixed(2)
    }, { transaction })

    for (const item of productData) {
      await OrderProduct.create({
        order_id: order.id,
        ...item
      }, { transaction })
    }
    
    await transaction.commit()
    
    res.status(201).json({
      success: true,
      data: {
        order_id: order.id,
        total_amount: order.total_amount,
        status: order.status
      }
    })
    
  } catch (error) {
    await transaction.rollback()
    console.error('Error creando pedido:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al crear pedido'
    })
  }
})

// GET /api/orders/:id - Obtener pedido con detalles
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{
        model: OrderProduct,
        include: [Product]
      }]
    })
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      })
    }
    
    res.status(200).json({
      success: true,
      data: order
    })
    
  } catch (error) {
    console.error('Error obteniendo pedido:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    })
  }
})

export default router
