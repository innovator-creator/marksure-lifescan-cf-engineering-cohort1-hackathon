import React from 'react';
import type { Product } from '@/lib/types/database';
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/constants/statuses';
import { CATEGORY_LABELS } from '@/lib/constants/categories';

interface ProductHeaderProps {
  product: Product;
}

export default function ProductHeader({ product }: ProductHeaderProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="shrink-0">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full md:w-48 h-48 object-cover rounded-xl border border-gray-200"
            />
          ) : (
            <div className="w-full md:w-48 h-48 bg-gray-50 rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center gap-2">
              <span className="text-4xl">
                {product.category === 'medicine' ? '💊' : product.category === 'cosmetic' ? '🧴' : '🍜'}
              </span>
              <span className="text-xs text-gray-400 font-medium">No image available</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {CATEGORY_LABELS[product.category] || product.category}
                </span>
                <span className={`text-xs font-medium px-2 py-1 rounded border ${STATUS_COLORS[product.status]}`}>
                  {STATUS_LABELS[product.status]}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{product.name}</h1>
              {product.manufacturer && (
                <p className="text-gray-600">
                  by <span className="font-medium">{product.manufacturer}</span>
                </p>
              )}
            </div>

            <div className="flex flex-col items-end shrink-0">
              <div className="text-center bg-gray-50 border border-gray-200 rounded-xl p-3 min-w-[100px]">
                <div className="text-xs text-gray-500 font-medium uppercase mb-1">Trust Score</div>
                <div className="text-3xl font-bold text-gray-900">{product.trust_score}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
