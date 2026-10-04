import React, { useState, useMemo, useEffect } from 'react';
import {
  Product,
  Order,
  PaymentCard,
  NotificationItem,
  UserProfile,
  SortMode,
  CartItem,
  Coordinates,
} from './types';
import {
  INITIAL_ORDERS,
  INITIAL_CARDS,
  INITIAL_NOTIFICATIONS,
  INITIAL_USER_PROFILE,
  INITIAL_REGISTERED_EMAILS,
} from './data/mockData';
import { Header } from './components/Header/Header';
import { Sidebar } from './components/Sidebar/Sidebar';
import { ProductGrid } from './components/Product/ProductGrid';
import { ProductDetailsModal } from './components/Product/ProductDetailsModal';
import { PurchaseHistoryModal } from './components/Header/PurchaseHistoryModal';
import { PaymentCardsModal } from './components/Header/PaymentCardsModal';
import { NotificationsModal } from './components/Header/NotificationsModal';
import { ProfileModal } from './components/Header/ProfileModal';
import { AuthModal } from './components/Auth/AuthModal';
import { CartDrawer } from './components/Cart/CartDrawer';
import { searchProducts } from './api/products';

export const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('closest');
  const [selectedStore, setSelectedStore] = useState<string | null>(null);

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1]);

  // Sidebar visibility
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // User Profile & Authentication State
  const [profile, setProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [deviceCoordinates, setDeviceCoordinates] = useState<Coordinates | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [registeredAccounts, setRegisteredAccounts] = useState<string[]>(INITIAL_REGISTERED_EMAILS);

  // Orders, Payment Cards & Notifications State
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [cards, setCards] = useState<PaymentCard[]>(INITIAL_CARDS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  // Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Modals & Drawers State
  const [detailsProduct, setDetailsProduct] = useState<Product | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isCardsOpen, setIsCardsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const searchLocation = profile.useDeviceGps && deviceCoordinates
    ? deviceCoordinates
    : profile.addressCoordinates;

  const uniqueStores = useMemo(
    () => Array.from(new Set(products.map((product) => product.storeName))),
    [products]
  );

  const { minPrice, maxPrice } = useMemo(() => {
    if (products.length === 0) {
      return { minPrice: 0, maxPrice: 1 };
    }

    const prices = products.map((product) => product.price);
    const minimum = Math.floor(Math.min(...prices));
    return {
      minPrice: minimum,
      maxPrice: Math.max(Math.ceil(Math.max(...prices)), minimum + 1),
    };
  }, [products]);

  useEffect(() => {
    const title = searchQuery.trim();
    if (!title) {
      setProducts([]);
      setSearchError(null);
      setIsSearching(false);
      setPriceRange([0, 1]);
      return;
    }

    const controller = new AbortController();
    setProducts([]);
    setSearchError(null);
    setIsSearching(true);

    const timeoutId = window.setTimeout(async () => {
      try {
        const results = await searchProducts(title, searchLocation, controller.signal);
        setProducts(results);
        if (results.length > 0) {
          const prices = results.map((product) => product.price);
          const minimum = Math.floor(Math.min(...prices));
          setPriceRange([
            minimum,
            Math.max(Math.ceil(Math.max(...prices)), minimum + 1),
          ]);
        } else {
          setPriceRange([0, 1]);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setProducts([]);
          setSearchError(error instanceof Error ? error.message : 'Product search failed.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false);
        }
      }
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [
    searchQuery,
    searchLocation.lat,
    searchLocation.lng,
    profile.useDeviceGps,
  ]);

  const requestDeviceLocation = (): Promise<Coordinates> => new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setDeviceCoordinates(coordinates);
        resolve(coordinates);
      },
      (error) => {
        const message = error.code === error.PERMISSION_DENIED
          ? 'Location permission was denied. Allow location access in your browser settings to use GPS.'
          : error.code === error.POSITION_UNAVAILABLE
            ? 'Your current location is unavailable.'
            : 'The location request timed out. Please try again.';
        reject(new Error(message));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });

  // Filter and Sort Pipeline
  const filteredAndSortedProducts = useMemo(() => {
    let list = [...products];

    // Filter by store
    if (selectedStore) {
      list = list.filter((p) => p.storeName === selectedStore);
    }

    // Filter by price range
    list = list.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // Apply Sorting:
    // Sort the API results by the selected price or calculated distance.
    if (sortMode === 'cheapest') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortMode === 'expensive') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortMode === 'closest') {
      list.sort((a, b) => a.distanceKm - b.distanceKm);
    }

    return list;
  }, [products, selectedStore, priceRange, sortMode]);

  // Cart operations
  const handleAddToCart = (product: Product, quantity: number = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const handleUpdateQty = (productId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => setCartItems([]);

  const handleCheckoutSuccess = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    // Also trigger notification
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'New Order Dispatched!',
        message: `Order #${newOrder.receiptNumber} placed via ${
          newOrder.deliveryType === 'combined' ? 'Combined Delivery' : 'Direct Store Delivery'
        }.`,
        timestamp: 'Just now',
        type: 'order',
        read: false,
        orderId: newOrder.id,
      },
      ...prev,
    ]);
    setIsHistoryOpen(true);
  };

  const handleAddCard = (newCard: PaymentCard) => {
    setCards((prev) => [newCard, ...prev]);
  };

  const handleSetDefaultCard = (id: string) => {
    setCards((prev) =>
      prev.map((c) => ({
        ...c,
        isDefault: c.id === id,
      }))
    );
  };

  const handleMarkAllNotifsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const activeOrdersCount = orders.filter(
    (o) => o.status === 'packing' || o.status === 'delivery'
  ).length;
  const unreadNotifsCount = notifications.filter((n) => !n.read).length;
  const cartTotalItems = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#0C4A6E] font-sans antialiased flex flex-col selection:bg-[#F3E8FF] selection:text-[#4C1D95]">
      {/* 1. Header with 10-part proportional layout */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        cartCount={cartTotalItems}
        unreadNotifsCount={unreadNotifsCount}
        activeOrdersCount={activeOrdersCount}
        profile={profile}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenCards={() => setIsCardsOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        isLoggedIn={isLoggedIn}
      />

      {/* 2. Main Viewport Area */}
      <main className="relative flex-1 px-4 py-4 w-full max-w-[1920px] mx-auto">
        {/* Sidebar Overlay positioned on the left directly under site logo */}
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          sortMode={sortMode}
          onSortChange={setSortMode}
          minPrice={minPrice}
          maxPrice={maxPrice}
          priceRange={priceRange}
          onPriceChange={(min, max) => setPriceRange([min, max])}
          selectedStore={selectedStore}
          onStoreSelect={setSelectedStore}
          stores={uniqueStores}
          totalResults={filteredAndSortedProducts.length}
        />

        {/* Dynamic Store Color Legend & Proximity Anchor Bar */}
        <section className={`mb-3.5 transition-all duration-300 ${isSidebarOpen ? 'pl-76' : 'pl-4'}`}>
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-2xl bg-[#F3E8FF]/30 border border-purple-100 text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-[#4C1D95] tracking-tight">Active Anchor:</span>
              <span className="text-gray-600 truncate max-w-md">
                📍 {profile.deliveryAddress}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-[#0C4A6E] font-semibold border border-purple-100">
                {profile.useDeviceGps ? 'GPS Active' : 'Address Anchor'}
              </span>
            </div>

            <div className="flex items-center space-x-2 text-[11px] text-gray-500">
              <span className="font-semibold text-[#0C4A6E]">Showing:</span>
              <span className="font-bold text-[#4C1D95]">
                {filteredAndSortedProducts.length} items
              </span>
              <span>•</span>
              <span className="capitalize font-medium">Sort: {sortMode}</span>
            </div>
          </div>
        </section>

        {/* 3. Product Grid Area (Strict 7 columns, exactly 2 rows visible height, vertically scrollable) */}
        <section className={`transition-all duration-300 ${isSidebarOpen ? 'pl-76' : 'pl-4'}`}>
          {isSearching ? (
            <p className="py-4 text-center text-xs text-gray-500" role="status">
              Searching products…
            </p>
          ) : searchError ? (
            <p className="py-4 text-center text-xs text-red-600" role="alert">
              {searchError}
            </p>
          ) : (
            <ProductGrid
              products={filteredAndSortedProducts}
              onAddToCart={(p) => handleAddToCart(p, 1)}
              onOpenDetails={(p) => setDetailsProduct(p)}
            />
          )}
        </section>
      </main>

      {/* Modals & Overlays */}
      <ProductDetailsModal
        product={detailsProduct}
        onClose={() => setDetailsProduct(null)}
        onAddToCart={handleAddToCart}
        deliveryAddress={profile.deliveryAddress}
      />

      {isHistoryOpen && (
        <PurchaseHistoryModal
          orders={orders}
          onClose={() => setIsHistoryOpen(false)}
          deliveryAddress={profile.deliveryAddress}
        />
      )}

      {isCardsOpen && (
        <PaymentCardsModal
          cards={cards}
          onClose={() => setIsCardsOpen(false)}
          onAddCard={handleAddCard}
          onSetDefault={handleSetDefaultCard}
        />
      )}

      {isNotificationsOpen && (
        <NotificationsModal
          notifications={notifications}
          onClose={() => setIsNotificationsOpen(false)}
          onMarkAllRead={handleMarkAllNotifsRead}
          onSelectOrderNotification={() => {
            setIsNotificationsOpen(false);
            setIsHistoryOpen(true);
          }}
        />
      )}

      {isProfileOpen && (
        <ProfileModal
          profile={profile}
          onClose={() => setIsProfileOpen(false)}
          onUpdateProfile={(updated) => setProfile(updated)}
          onRequestDeviceLocation={requestDeviceLocation}
        />
      )}

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        existingAccounts={registeredAccounts}
        onLoginSuccess={(name, email) => {
          setProfile((p) => ({ ...p, name, email }));
          setIsLoggedIn(true);
          setRegisteredAccounts((prev) => [...prev, email]);
        }}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onCheckoutSuccess={handleCheckoutSuccess}
        deliveryAddress={profile.deliveryAddress}
      />
    </div>
  );
};
