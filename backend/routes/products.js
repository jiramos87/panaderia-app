import express from 'express'

import Product from '../models/Product.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { active: true },
      order: [['name', 'ASC']]
    })
    
    res.status(200).json({
      success: true,
      data: products,
      count: products.length
    })
    
  } catch (error) {
    console.error('Error obteniendo productos:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener productos'
    })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const product = await Product.findOne({
      where: { id, active: true }
    })

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      })
    }
    
    res.status(200).json({
      success: true,
      data: product
    })
    
  } catch (error) {
    console.error('Error obteniendo producto por ID:', error)
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener el producto'
    })
  }
})

export default router
