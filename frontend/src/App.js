import React, { useState, useEffect } from 'react'

import './App.css'
import { productService, orderService } from './services/api'

function App() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [customerData, setCustomerData] = useState({
    customer_name: '',
    customer_email: ''
  })
  const [loading, setLoading] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(null)
  const [productsLoading, setProductsLoading] = useState(true)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setProductsLoading(true)
      const response = await productService.getAll()
      setProducts(response.data.data)
    } catch (error) {
      console.error('Error loading products:', error)
      alert('Error cargando productos. Verifica tu conexión.')
    } finally {
      setProductsLoading(false)
    }
  }

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.product_id === product.id)
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.product_id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, { 
        product_id: product.id, 
        name: product.name,
        price: product.price,
        quantity: 1 
      }])
    }
  }

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product_id !== productId))
  }

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(productId)
    } else {
      setCart(cart.map(item =>
        item.product_id === productId
          ? { ...item, quantity: newQuantity }
          : item
      ))
    }
  }

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0)
  }

  const handleSubmitOrder = async (e) => {
    e.preventDefault()
    
    if (cart.length === 0) {
      alert('El carrito está vacío')
      return
    }

    if (!customerData.customer_name.trim()) {
      alert('Por favor ingresa tu nombre')
      return
    }

    setLoading(true)
    
    try {
      const orderData = {
        ...customerData,
        products: cart.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        }))
      }

      const response = await orderService.create(orderData)
      setOrderSuccess(response.data.data)
      setCart([])
      setCustomerData({ customer_name: '', customer_email: '' })
    } catch (error) {
      alert('Error al crear el pedido. Por favor intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  if (orderSuccess) {
    return (
      <div className="App">
        <div className="success-message">
          <h2>¡Pedido creado exitosamente!</h2>
          <p>Número de pedido: {orderSuccess.order_id}</p>
          <p>Total: ${orderSuccess.total_amount}</p>
          <button onClick={() => setOrderSuccess(null)}>
            Hacer otro pedido
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Panadería Online</h1>
      </header>

      <main className="main-content">
        <div className="products-section">
          <h2>Nuestros Productos</h2>
          <div className="products-grid">
            {productsLoading ? (
              <div className="loading-message">Cargando productos...</div>
            ) : (
              products.map(product => (
              <div key={product.id} className="product-card">
                <h3>{product.name}</h3>
                <p className="description">{product.description}</p>
                <p className="price">${product.price}</p>
                <button onClick={() => addToCart(product)}>
                  Agregar al carrito
                </button>
              </div>
            ))
            )}
          </div>
        </div>

        <div className="cart-section">
          <h2>Carrito de Compras</h2>
          {cart.length === 0 ? (
            <p>El carrito está vacío</p>
          ) : (
            <>
              {cart.map(item => (
                <div key={item.product_id} className="cart-item">
                  <span>{item.name}</span>
                  <div className="quantity-controls">
                    <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)}>
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)}>
                      +
                    </button>
                  </div>
                  <span>${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                  <button onClick={() => removeFromCart(item.product_id)}>
                    Eliminar
                  </button>
                </div>
              ))}
              
              <div className="cart-total">
                <strong>Total: ${calculateTotal().toFixed(2)}</strong>
              </div>

              <form onSubmit={handleSubmitOrder} className="order-form">
                <h3>Datos del Cliente</h3>
                <input
                  type="text"
                  placeholder="Nombre completo"
                  value={customerData.customer_name}
                  onChange={(e) => setCustomerData({
                    ...customerData,
                    customer_name: e.target.value
                  })}
                  required
                />
                <input
                  type="email"
                  placeholder="Email (opcional)"
                  value={customerData.customer_email}
                  onChange={(e) => setCustomerData({
                    ...customerData,
                    customer_email: e.target.value
                  })}
                />
                <button type="submit" disabled={loading}>
                  {loading ? 'Procesando...' : 'Finalizar Pedido'}
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
