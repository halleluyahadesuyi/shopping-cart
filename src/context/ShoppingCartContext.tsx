import { ReactNode, createContext, useContext, useState } from "react";
import { ShoppingCart } from "../components/ShoppingCart";
import { useLocalStorage } from "../hooks/useLocalStorage";

// Declare data types of ShoppingCartProvider's props i.e. children
type ShoppingCartProviderProps = {
  children: ReactNode;
};

// Declare data types of cart items
// Id number leads to other items' details like name and price
// Quantity number can be multiplied with assigned item's price to know the total resulting price
type CartItem = {
  id: number;
  quantity: number;
};

// Declare data types of ShoppingCartContext functions etc.
// "addToCart" is not added as part of the functions because "increaseCartQuantity" does the same job
type ShoppingCartContext = {
  openCart: () => void;
  closeCart: () => void;
  getItemQuantity: (id: number) => number;
  increaseCartQuantity: (id: number) => void;
  decreaseCartQuantity: (id: number) => void;
  removeFromCart: (id: number) => void;
  cartQuantity: number;
  cartItems: CartItem[];
};

const ShoppingCartContext = createContext({} as ShoppingCartContext);

export function useShoppingCart() {
  return useContext(ShoppingCartContext);
}

export function ShoppingCartProvider({ children }: ShoppingCartProviderProps) {
  // State variable to open and close cart
  const [isOpen, setIsOpen] = useState(false);

  // Store state of cart items
  const [cartItems, setCartItems] = useLocalStorage<CartItem[]>("shopping-cart", []);

  // Count all the quantities of Each item in the cart and return a total value
  const cartQuantity = cartItems.reduce(
    (quantity, item) => item.quantity + quantity,
    0
  );

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  // Create functions that will increment, decrement etc. cart items' values

  function getItemQuantity(id: number) {
    // Find the current cart items with the id, where the item.id === id
    // If that value is true, return quantity, otherwise return a default value of 0
    return cartItems.find((item) => item.id === id)?.quantity || 0;
  }

  function increaseCartQuantity(id: number) {
    setCartItems((currItems) => {
      // If an item can't be found in the cart, add a new item for it
      if (currItems.find((item) => item.id === id) == null) {
        return [...currItems, { id, quantity: 1 }];
      } else {
        // Otherwise, if the item exists, keep everything the same, but increment the quantity by 1
        return currItems.map((item) => {
          if (item.id === id) {
            return { ...item, quantity: item.quantity + 1 };
          } else {
            // Otherwise, return the item without any changes
            return item;
          }
        });
      }
    });
  }

  function decreaseCartQuantity(id: number) {
    setCartItems((currItems) => {
      // If item quantity equals 1, remove it
      if (currItems.find((item) => item.id === id)?.quantity === 1) {
        // Return a new list of all current items, remove whichever one whose id was passed
        // If an id is passed for an item that doesn't exist, the same current list would still be returned
        return currItems.filter((item) => item.id !== id);
      } else {
        // Otherwise, keep everything the same, but decrement the quantity by 1
        return currItems.map((item) => {
          if (item.id === id) {
            return { ...item, quantity: item.quantity - 1 };
          } else {
            // Otherwise, return the item without any changes
            return item;
          }
        });
      }
    });
  }

  function removeFromCart(id: number) {
    setCartItems((currItems) => {
      // Filter out items whose id is not equal to the current item's id
      return currItems.filter((item) => item.id !== id);
    });
  }

  return (
    <ShoppingCartContext.Provider
      value={{
        getItemQuantity,
        increaseCartQuantity,
        decreaseCartQuantity,
        removeFromCart,
        openCart,
        closeCart,
        cartItems,
        cartQuantity,
      }}
    >
      {children}
      <ShoppingCart isOpen={isOpen} />
    </ShoppingCartContext.Provider>
  );
}
