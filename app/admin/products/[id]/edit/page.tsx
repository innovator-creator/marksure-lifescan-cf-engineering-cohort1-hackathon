'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import type { ProductCategory, ProductStatus } from '@/lib/types/database';
import type { Product } from '@/lib/types/database';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [product, setProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'medicine' as ProductCategory,
    manufacturer: '',
    manufacturer_verified: false,
    country_of_origin: '',
    batch_number: '',
    expiry_date: '',
    barcode: '',
    qr_code: '',
    image_url: '',
    status: 'unknown' as ProductStatus,
    verified_by_authority: false,
    trust_score: 50,
  });

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/admin/products/${params.id}`);
      const data = await response.json();
      
      if (data.product) {
        setProduct(data.product);
        setFormData({
          name: data.product.name,
          category: data.product.category,
          manufacturer: data.product.manufacturer || '',
          manufacturer_verified: data.product.manufacturer_verified,
          country_of_origin: data.product.country_of_origin || '',
          batch_number: data.product.batch_number || '',
          expiry_date: data.product.expiry_date || '',
          barcode: data.product.barcode || '',
          qr_code: data.product.qr_code || '',
          image_url: data.product.image_url || '',
          status: data.product.status,
          verified_by_authority: data.product.verified_by_authority,
          trust_score: data.product.trust_score,
        });
      } else {
        setError('Product not found');
      }
    } catch {
      setError('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [params.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/products/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update product');
      }

      router.push('/admin/products');
    } catch {
      setError('Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center text-red-600">{error || 'Product not found'}</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <a href="/admin/products" className="text-teal-600 hover:underline mb-4 inline-block">
          ← Back to Products
        </a>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Product</h1>
        <p className="text-gray-600">Update product information</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            required
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as ProductCategory })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="medicine">Medicine</option>
            <option value="cosmetic">Cosmetic</option>
            <option value="food">Food</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Manufacturer
          </label>
          <input
            type="text"
            value={formData.manufacturer}
            onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="manufacturer_verified"
            checked={formData.manufacturer_verified}
            onChange={(e) => setFormData({ ...formData, manufacturer_verified: e.target.checked })}
            className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
          />
          <label htmlFor="manufacturer_verified" className="ml-2 text-sm text-gray-700">
            Manufacturer Verified
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Country of Origin
          </label>
          <input
            type="text"
            value={formData.country_of_origin}
            onChange={(e) => setFormData({ ...formData, country_of_origin: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Batch Number
          </label>
          <input
            type="text"
            value={formData.batch_number}
            onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expiry Date
          </label>
          <input
            type="date"
            value={formData.expiry_date}
            onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Barcode
          </label>
          <input
            type="text"
            value={formData.barcode}
            onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            QR Code
          </label>
          <input
            type="text"
            value={formData.qr_code}
            onChange={(e) => setFormData({ ...formData, qr_code: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image URL
          </label>
          <input
            type="url"
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status *
          </label>
          <select
            required
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as ProductStatus })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="verified_safe">Verified Safe</option>
            <option value="under_review">Under Review</option>
            <option value="suspected_counterfeit">Suspected Counterfeit</option>
            <option value="recalled">Recalled</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="verified_by_authority"
            checked={formData.verified_by_authority}
            onChange={(e) => setFormData({ ...formData, verified_by_authority: e.target.checked })}
            className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
          />
          <label htmlFor="verified_by_authority" className="ml-2 text-sm text-gray-700">
            Verified by Authority
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trust Score (0-100)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={formData.trust_score}
            onChange={(e) => setFormData({ ...formData, trust_score: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-teal-600 text-white py-3 px-4 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Update Product'}
          </button>
          <a
            href="/admin/products"
            className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-md hover:bg-gray-700 text-center"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
