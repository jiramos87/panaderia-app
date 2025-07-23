import Product from './Product.js'
import Order from './Order.js'
import OrderProduct from './OrderProduct.js'

Order.belongsToMany(Product, {
  through: OrderProduct,
  foreignKey: 'order_id',
  otherKey: 'product_id'
})

Product.belongsToMany(Order, {
  through: OrderProduct,
  foreignKey: 'product_id',
  otherKey: 'order_id'
})

Order.hasMany(OrderProduct, { foreignKey: 'order_id' })
OrderProduct.belongsTo(Order, { foreignKey: 'order_id' })

Product.hasMany(OrderProduct, { foreignKey: 'product_id' })
OrderProduct.belongsTo(Product, { foreignKey: 'product_id' })

export {
  Product,
  Order,
  OrderProduct
}
