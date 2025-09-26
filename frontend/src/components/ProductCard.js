import React from 'react';
import { Link } from 'react-router-dom';
import { APP_CONFIG } from '../config/appConfig';

const ProductCard = ({ product, className = "" }) => {
  const { currency } = APP_CONFIG;
  
  const formatPrice = (price) => {
    return currency.position === 'before' 
      ? `${currency.symbol}${price}` 
      : `${price}${currency.symbol}`;
  };

  const discountPercentage = product.price > product.sellingPrice 
    ? Math.round(((product.price - product.sellingPrice) / product.price) * 100)
    : 0;

  return (
    <div className={`card card-hover group ${className}`}>
      <Link to={`/product/${product._id}`} className="block">
        {/* Imagen del producto */}
        <div className="relative overflow-hidden bg-neutral-100 aspect-square">
          <img
            src={product.productImage[0]}
            alt={product.productName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Badge de descuento */}
          {discountPercentage > 0 && (
            <div className="absolute top-3 left-3 bg-error text-white text-xs font-semibold px-2 py-1 rounded-full">
              -{discountPercentage}%
            </div>
          )}
          
          {/* Badge de stock */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-neutral-800 text-white px-3 py-1 rounded-full text-sm font-medium">
                Agotado
              </span>
            </div>
          )}
          
          {/* Botón de acción rápida */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <button className="bg-white text-neutral-900 px-4 py-2 rounded-lg font-medium text-sm transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-primary-50 hover:text-primary-600">
              Ver Detalles
            </button>
          </div>
        </div>

        {/* Contenido de la tarjeta */}
        <div className="p-4 space-y-3">
          {/* Categoría */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
              {product.category}
            </span>
            {product.subcategory && (
              <span className="text-xs text-neutral-500">
                • {product.subcategory}
              </span>
            )}
          </div>

          {/* Nombre del producto */}
          <h3 className="font-semibold text-neutral-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {product.productName}
          </h3>

          {/* Marca */}
          <p className="text-sm text-neutral-600">
            {product.brandName}
          </p>

          {/* Precios */}
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-neutral-900">
              {formatPrice(product.sellingPrice)}
            </span>
            {product.price > product.sellingPrice && (
              <span className="text-sm text-neutral-500 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Rating y stock */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-1">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-neutral-600">(4.5)</span>
            </div>
            
            <div className="text-neutral-500">
              {product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}
            </div>
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {product.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
