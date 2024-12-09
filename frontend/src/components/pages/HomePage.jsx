import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '../../hooks/useCart';

function HomePage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [category, setCategory] = React.useState('');
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products', searchTerm, category],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (category) params.append('category', category);
      const response = await axios.get(`/api/products?${params.toString()}`);
      return response.data || []; // Ensure we return an array //old conf - return response.data;
    }
  });

  const categories = [
    'All',
    'Electronics',
    'Clothing',
    'Books',
    'Home & Garden',
    'Sports'
  ];

  const handleAddToCart = (product) => {
    addToCart(product);
    // Show a toast notification
    alert('Product added to cart!');
  };

  if (error) return <div className="text-center p-4">Error loading products</div>;

  return (
   <div className="container mx-auto px-4 py-8">
     {/* Header */}
     <header className="bg-slate-800 text-white py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">RomiHub Store</h1>
          <nav className="flex gap-4">
            <Button variant="ghost" onClick={() => navigate('/cart')}>Cart</Button>
            <Button variant="ghost" onClick={() => navigate('/login')}>Login</Button>
          </nav>
        </div>
     </header>

     <main className="flex-grow container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-8 mb-8">
        <h1 className="text-4xl font-bold mb-4">Welcome to RomiHub Store</h1>
        <p className="text-xl mb-4">Discover amazing products at great prices</p>
        <Button 
          onClick={() => navigate('/products')}
          className="bg-white text-blue-600 hover:bg-gray-100"
        >
          Browse All Products
        </Button>
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-wrap gap-4 mb-8">
        <Input
          type="search"
          placeholder="Search products..."
          className="max-w-xs"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={category === cat ? "default" : "outline"}
              onClick={() => setCategory(cat === 'All' ? '' : cat)}
              className="min-w-[100px]"
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
      {isLoading ? (
        <div className="text-center p-4">Loading products...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.isArray(products) && products.length > 0 ? (
            products.map((product) => (
              <Card key={product.id} className="flex flex-col justify-between">
                <CardHeader>
                  <CardTitle>{product.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{product.description}</p>
                  <p className="text-lg font-bold mb-4">${product.price}</p>
                  <Button 
                    onClick={() => {
                      addToCart(product);
                      alert('Product added to cart!');
                    }}
                    className="w-full"
                  >
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center p-4">
              No products found.
            </div>
          )}
        </div>
      )}
      </main>
      {/* Footer */}
      <footer className="bg-slate-800 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-2">RomiHub Store</h3>
              <p>Your one-stop shop for quality products</p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="/products" className="hover:text-blue-400">Products</a></li>
                <li><a href="/cart" className="hover:text-blue-400">Cart</a></li>
                <li><a href="/about" className="hover:text-blue-400">About Us</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2">Contact</h3>
              <ul className="space-y-2">
                <li>Email: support@romihubstore.com</li>
                <li>Phone: (123) 456-7890</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 mt-6 pt-6 text-center">
            <p>&copy; {new Date().getFullYear()} RomiHub Store. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;