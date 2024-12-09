import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Products from './components/Products';
import Login from './components/Login';
import Register from './components/Register';
import Cart from './components/Cart';
import HomePage from './components/pages/HomePage';
import Checkout from './components/checkout/Checkout';
import OrderSuccess from './components/checkout/OrderSuccess';
import ProductManagement from './components/admin/ProductManagement';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="app">
          <h1>E-commerce Store</h1>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<Products />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path="/admin/products" element={<ProductManagement />} />
          </Routes>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
