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
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const product = await AsyncStorage.getItem('@GoMarket:product');
      if (product) {
        setProducts(JSON.parse(product));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      // TODO ADD A NEW ITEM TO THE CART
      const checkExistProduct = products.findIndex(
        productExist => productExist.id === product.id,
      );

      if (checkExistProduct >= 0) {
        // products[checkExistProduct].quantity += 1;
        const newProduct = products.reduce((acc, item) => {
          if (item.id === product.id) {
            const updated = { ...item, quantity: item.quantity + 1 };

            return [...acc, updated];
          }
          return [...acc, item];
        }, [] as Product[]);

        setProducts(newProduct);
        await AsyncStorage.setItem(
          '@GoMarket:product',
          JSON.stringify(newProduct),
        );

        return;
      }

      const newProduct = { ...product, quantity: 1 };
      setProducts(oldProducts => [...oldProducts, newProduct]);
      await AsyncStorage.setItem(
        '@GoMarket:product',
        JSON.stringify(newProduct),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const newProduct = products.reduce((acc, item) => {
        if (item.id !== id) {
          return [...acc, item];
        }

        const updatedItem = { ...item, quantity: item.quantity + 1 };

        return [...acc, updatedItem];
      }, [] as Product[]);

      setProducts(newProduct);

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(newProduct),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const newProduct = products.reduce((acc, item) => {
        if (item.id !== id) {
          return [...acc, item];
        }

        if (item.quantity === 1) {
          return acc;
        }

        const updatedItem = { ...item, quantity: item.quantity - 1 };

        return [...acc, updatedItem];
      }, [] as Product[]);

      setProducts(newProduct);

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(newProduct),
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
