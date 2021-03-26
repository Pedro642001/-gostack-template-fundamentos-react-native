import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const listProducts = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );

      if (listProducts) {
        setProducts(JSON.parse(listProducts));
      }
    }
    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const verifyProductExist = products.find(item => item.id === product.id);

      if (verifyProductExist) {
        setProducts(
          products.map(item =>
            item.id === product.id
              ? { ...product, quantity: item.quantity + 1 }
              : item,
          ),
        );

        return;
      }

      const newProduct = {
        id: product.id,
        title: product.title,
        image_url: product.image_url,
        price: product.price,
        quantity: 1,
      };

      setProducts([...products, newProduct]);

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const newProducts = products.map(item =>
        item.id === id
          ? {
            ...item,
            quantity: item.quantity + 1,
          }
          : item,
      );

      setProducts(newProducts);

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );
  const decrement = useCallback(
    async id => {
      const newProducts = products.map(item =>
        item.id === id
          ? {
            ...item,
            quantity: item.quantity - 1,
          }
          : item,
      );

      setProducts(newProducts);

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
