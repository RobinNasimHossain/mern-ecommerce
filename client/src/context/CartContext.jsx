import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'cart_v1';

const initialState = {
  items: [],
  shippingAddress: null,
  paymentMethod: 'stripe',
};

const loadInitial = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...initialState, ...JSON.parse(raw) } : initialState;
  } catch {
    return initialState;
  }
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const exists = state.items.find((i) => i.product === action.payload.product);
      const items = exists
        ? state.items.map((i) =>
            i.product === action.payload.product
              ? { ...i, qty: Math.min(i.qty + action.payload.qty, action.payload.countInStock) }
              : i
          )
        : [...state.items, action.payload];
      return { ...state, items };
    }
    case 'UPDATE_QTY': {
      const items = state.items
        .map((i) =>
          i.product === action.payload.product ? { ...i, qty: action.payload.qty } : i
        )
        .filter((i) => i.qty > 0);
      return { ...state, items };
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((i) => i.product !== action.payload.product),
      };
    case 'CLEAR':
      return { ...state, items: [] };
    case 'SET_SHIPPING':
      return { ...state, shippingAddress: action.payload };
    case 'SET_PAYMENT':
      return { ...state, paymentMethod: action.payload };
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitial);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const value = useMemo(() => {
    const itemsPrice = state.items.reduce((acc, i) => acc + i.price * i.qty, 0);
    const shippingPrice = itemsPrice > 100 || itemsPrice === 0 ? 0 : 10;
    const taxPrice = Number((itemsPrice * 0.08).toFixed(2));
    const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));
    const totalQty = state.items.reduce((acc, i) => acc + i.qty, 0);

    return {
      ...state,
      totalQty,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      addItem: (product, qty = 1) =>
        dispatch({
          type: 'ADD_ITEM',
          payload: {
            product: product._id,
            name: product.name,
            image: product.image,
            price: product.price,
            countInStock: product.countInStock,
            qty,
          },
        }),
      updateQty: (product, qty) =>
        dispatch({ type: 'UPDATE_QTY', payload: { product, qty } }),
      removeItem: (product) => dispatch({ type: 'REMOVE_ITEM', payload: { product } }),
      clearCart: () => dispatch({ type: 'CLEAR' }),
      setShippingAddress: (addr) => dispatch({ type: 'SET_SHIPPING', payload: addr }),
      setPaymentMethod: (method) => dispatch({ type: 'SET_PAYMENT', payload: method }),
    };
  }, [state]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
