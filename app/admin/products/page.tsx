'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Product } from '@/lib/types/database';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchProducts = async (searchQuery = '') => {
    try {
      const url = searchQuery 
        ? `/api/admin/products?search=${encodeURIComponent(searchQuery)}`
        : '/api/admin/products';
      const response = await fetch(url);
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    fetchProducts(search);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProducts(products.filter(p => p.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Link href="/admin" className="text-teal-600 hover:underline mb-4 inline-block">
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Products</h1>
        <p className="text-gray-600">Manage product database</p>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            type="submit"
            className="bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700"
          >
            Search
          </button>
        </form>
      </div>

      <div className="bg-white shadow-md rounded-lg">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="font-semibold text-gray-900">
            {products.length} Products
          </h2>
          <Link
            href="/admin/products/new"
            className="bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700"
          >
            Add New Product
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No products found</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {products.map((product) => (
              <div key={product.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{product.name}</h3>
                  <p className="text-sm text-gray-600">
                    {product.category} • {product.status} • Score: {product.trust_score}
                  </p>
                  {product.barcode && (
                    <p className="text-xs text-gray-500">Barcode: {product.barcode}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/product/${product.id}`}
                    className="text-sm text-teal-600 hover:underline"
                    target="_blank"
                  >
                    View
                  </Link>
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
