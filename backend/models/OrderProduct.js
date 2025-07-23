import { DataTypes } from 'sequelize'

import { sequelize } from '../config/database.js'

const OrderProduct = sequelize.define('OrderProduct', {
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0.01
    }
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0.01
    }
  }
}, {
  tableName: 'order_products',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
})

export default OrderProduct
