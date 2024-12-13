import {
  useState,
  useEffect,
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo
} from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate
} from 'react-router-dom';
import PropTypes from 'prop-types';

// Updated CSS for modern styling (you would typically have this in a separate CSS file)
const styles = `
  body {
    font-family: 'Open Sans', sans-serif;
    margin: 0;
    padding: 0;
    background-color: #f2f2f2;
    color: #333;
  }
  .app-container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 20px;
  }
  .main-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #3498db;
    padding: 10px 20px;
    color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  .main-nav a {
    color: white;
    text-decoration: none;
    margin: 0 10px;
    font-weight: bold;
    transition: color 0.3s ease;
  }
  .main-nav a:hover {
    color: #e0f2fe;
  }
  .product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
    margin-top: 20px;
  }
  .product-card {
    background-color: #fff;
    border-radius: 5px;
    padding: 20px;
    text-align: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .product-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  .product-card img {
    max-width: 100%;
    height: 250px;
    object-fit: cover;
    margin-bottom: 15px;
    border-radius: 5px;
  }
  .quantity-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 10px 0;
  }
  .quantity-controls button {
    background-color: #3498db;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 3px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  .quantity-controls button:hover {
    background-color: #2980b9;
  }
  .cart-item {
    display: flex;
    align-items: center;
    background-color: #fff;
    padding: 15px;
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin-bottom: 15px;
  }
  .cart-item img {
    width: 120px;
    height: 120px;
    object-fit: cover;
    border-radius: 5px;
    margin-right: 15px;
  }
  button {
    background-color: #3498db;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  button:hover {
    background-color: #2980b9;
  }
`;

// Inject styles
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

// Cart Context
const CartContext = createContext();

// Initial State
const initialState = {
  cart: [],
  products: [],
  error: null,
  loading: true,
};

// Cart Reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const { product, quantity } = action.payload;
      const existingItemIndex = state.cart.findIndex((item) => item.product.id === product.id);

      if (existingItemIndex > -1) {
        const updatedCart = [...state.cart];
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: updatedCart[existingItemIndex].quantity + quantity
        };
        return { ...state, cart: updatedCart };
      }

      return { ...state, cart: [...state.cart, { product, quantity }] };
    }
    case 'UPDATE_CART_ITEM_QUANTITY': {
      const { productId, quantity } = action.payload;
      return {
        ...state,
        cart: state.cart.map((item) =>
          item.product.id === productId 
            ? { ...item, quantity: Math.max(1, quantity) } 
            : item
        ),
      };
    }
    case 'REMOVE_FROM_CART': {
      return {
        ...state,
        cart: state.cart.filter(item => item.product.id !== action.payload.productId)
      };
    }
    default:
      return state;
  }
};

// Products Reducer
const productsReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_PRODUCTS_SUCCESS':
      return { products: action.payload, loading: false, error: null };
    case 'FETCH_PRODUCTS_FAILURE':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

// Home Component
function Home() {
  return (
    <div className="app-container">
      <h1>Welcome to Our Store</h1>
      <p>Browse our amazing collection of products!</p>
      <Link to="/shop" className="btn">Start Shopping</Link>
    </div>
  );
}

// Product Card Component
function ProductCard({ product }) {
  const { addToCart } = useContext(CartContext);
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = useCallback(() => {
    addToCart(product, quantity);
    setQuantity(1);
  }, [product, quantity, addToCart]);

  return (
    <div className="product-card">
      <img 
        src={product.image} 
        alt={product.title}
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/200';
          e.target.onerror = null;
        }}
      />
      <h3>{product.title}</h3>
      <p>${product.price.toFixed(2)}</p>
      <div className="quantity-controls">
        <button onClick={() => setQuantity(prev => Math.max(1, prev - 1))}>-</button>
        <span>{quantity}</span>
        <button onClick={() => setQuantity(prev => prev + 1)}>+</button>
      </div>
      <button onClick={handleAddToCart}>Add to Cart</button>
    </div>
  );
}

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
  }).isRequired,
};

// Shop Component
function Shop() {
  const [{ products, error, loading }, dispatch] = useReducer(productsReducer, {
    products: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    const controller = new AbortController();
    
    const fetchProducts = async () => {
      try {
        const response = await fetch('https://fakestoreapi.com/products', { 
          signal: controller.signal 
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        dispatch({ type: 'FETCH_PRODUCTS_SUCCESS', payload: data });
      } catch (err) {
        if (err.name !== 'AbortError') {
          dispatch({ 
            type: 'FETCH_PRODUCTS_FAILURE', 
            payload: err.message || 'Failed to load products' 
          });
        }
      }
    };

    fetchProducts();
    return () => controller.abort();
  }, []);

  if (loading) return <div>Loading products...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="app-container">
      <h1>Our Products</h1>
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

// Cart Component
function Cart() {
  const { cartState, dispatchCart } = useContext(CartContext);
  const navigate = useNavigate();

  const cartTotal = useMemo(() => 
    cartState.cart.reduce((total, item) => 
      total + (item.product.price * item.quantity), 0
    ), [cartState.cart]
  );

  const updateQuantity = (productId, quantity) => {
    if (quantity > 0) {
      dispatchCart({ 
        type: 'UPDATE_CART_ITEM_QUANTITY', 
        payload: { productId, quantity } 
      });
    }
  };

  const removeItem = (productId) => {
    dispatchCart({ 
      type: 'REMOVE_FROM_CART', 
      payload: { productId } 
    });
  };

  if (cartState.cart.length === 0) {
    return (
      <div className="app-container">
        <h1>Your Cart is Empty</h1>
        <button onClick={() => navigate('/shop')}>
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="app-container">
      <h1>Your Cart</h1>
      {cartState.cart.map((item) => (
        <div key={item.product.id} className="cart-item">
          <img 
            src={item.product.image} 
            alt={item.product.title}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/100';
              e.target.onerror = null;
            }}
          />
          <div>
            <h3>{item.product.title}</h3>
            <p>Price: ${item.product.price.toFixed(2)}</p>
            <div>
              <button 
                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                disabled={item.quantity <= 1}
              >
                -
              </button>
              <span>{item.quantity}</span>
              <button 
                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
              >
                +
              </button>
            </div>
            <button onClick={() => removeItem(item.product.id)}>
              Remove
            </button>
          </div>
        </div>
      ))}
      <div>
        <h2>Total: ${cartTotal.toFixed(2)}</h2>
        <button>Proceed to Checkout</button>
      </div>
    </div>
  );
}

// Cart Provider Component
function CartProvider({ children }) {
  const [cartState, dispatchCart] = useReducer(cartReducer, initialState);

  const addToCart = useCallback((product, quantity) => {
    dispatchCart({ 
      type: 'ADD_TO_CART', 
      payload: { product, quantity } 
    });
  }, []);

  const cartCount = useMemo(() => 
    cartState.cart.reduce((sum, item) => sum + item.quantity, 0), 
    [cartState.cart]
  );

  return (
    <CartContext.Provider value={{ 
      cartState, 
      addToCart, 
      cartCount, 
      dispatchCart 
    }}>
      {children}
    </CartContext.Provider>
  );
}

// Cart Status Component
function CartStatus() {
  const { cartCount } = useContext(CartContext);
  const navigate = useNavigate();

  return (
    <div>
      <button onClick={() => navigate('/cart')}>
        Cart: {cartCount} items
      </button>
    </div>
  );
}

// Main App Component
function App() {
  return (
    <CartProvider>
      <Router>
        <div className="app-container">
          <nav className="main-nav">
            <div>
              <Link to="/">Home</Link>
              <Link to="/shop">Shop</Link>
            </div>
            <CartStatus />
          </nav>

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/cart" element={<Cart />} />
          </Routes>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;