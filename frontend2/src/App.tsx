import React, { useState, useMemo, useRef } from 'react';
import {
  Product,
  Order,
  PaymentCard,
  NotificationItem,
  UserProfile,
  SortMode,
  CartItem,
} from './types';
import {
  INITIAL_PRODUCTS,
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

export const App: React.FC = () => {
  // 1. Initial products saved locally to guarantee deterministic revert to "Closest"
  // State Management Requirement: "save the initial array locally so the user can easily revert back to this exact 'Closest' order."
  const initialProductsSnapshot = useRef<Product[]>([...INITIAL_PRODUCTS]);

  // Client-Side Filter & Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('closest');
  const [selectedStore, setSelectedStore] = useState<string | null>(null);

  // Price range calculation
  const allPrices = useMemo(() => INITIAL_PRODUCTS.map((p) => p.price), []);
  const minPrice = Math.floor(Math.min(...allPrices));
  const maxPrice = Math.ceil(Math.max(...allPrices));
  const [priceRange, setPriceRange] = useState<[number, number]>([minPrice, maxPrice]);

  // Sidebar visibility
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // User Profile & Authentication State
  const [profile, setProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [registeredAccounts, setRegisteredAccounts] = useState<string[]>(INITIAL_REGISTERED_EMAILS);

  // Orders, Payment Cards & Notifications State
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [cards, setCards] = useState<PaymentCard[]>(INITIAL_CARDS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  // Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([
    { product: INITIAL_PRODUCTS[0], quantity: 1 },
    { product: INITIAL_PRODUCTS[5], quantity: 1 },
  ]);

  // Modals & Drawers State
  const [detailsProduct, setDetailsProduct] = useState<Product | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isCardsOpen, setIsCardsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // List of unique store names for filtering
  const uniqueStores = useMemo(() => {
    return Array.from(new Set(INITIAL_PRODUCTS.map((p) => p.storeName)));
  }, []);

  // Filter and Sort Pipeline
  const filteredAndSortedProducts = useMemo(() => {
    // Start with the exact initial array snapshot for "Closest"
    let list = [...initialProductsSnapshot.current];

    // Filter by search query (product name, description, or store name)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.storeName.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    // Filter by store
    if (selectedStore) {
      list = list.filter((p) => p.storeName === selectedStore);
    }

    // Filter by price range
    list = list.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // Apply Sorting:
    // If 'closest', preserve the saved initial array order (filtered)
    // If 'cheapest' or 'expensive', apply price comparator
    if (sortMode === 'cheapest') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortMode === 'expensive') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortMode === 'closest') {
      // Guaranteed fallback to original localized distance order
      const initialOrderMap = new Map(
        initialProductsSnapshot.current.map((item, idx) => [item.id, idx])
      );
      list.sort((a, b) => {
        const indexA = initialOrderMap.get(a.id) ?? 0;
        const indexB = initialOrderMap.get(b.id) ?? 0;
        return indexA - indexB;
      });
    }

    return list;
  }, [searchQuery, selectedStore, priceRange, sortMode]);

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
          <ProductGrid
            products={filteredAndSortedProducts}
            onAddToCart={(p) => handleAddToCart(p, 1)}
            onOpenDetails={(p) => setDetailsProduct(p)}
          />
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
