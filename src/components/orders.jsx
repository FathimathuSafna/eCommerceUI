import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  Truck,
  MapPin,
  Phone,
  Star,
  MessageCircle,
  MoreVertical,
  Package,
  CreditCard,
  Receipt,
  RefreshCw,
  AlertCircle,
  Navigation,
} from "lucide-react";

export const OrderPage = () => {
  const [activeTab, setActiveTab] = useState("active");
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Sample order data
  const [orders, setOrders] = useState({
    active: [
      {
        id: "ORD001",
        restaurantName: "Mario's Pizzeria",
        restaurantImage: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=100&h=100&fit=crop",
        status: "preparing",
        estimatedTime: "25-30 mins",
        orderTime: "2:45 PM",
        total: 599,
        items: [
          { name: "Margherita Pizza", quantity: 2, price: 299 },
          { name: "Garlic Bread", quantity: 1, price: 99 }
        ],
        deliveryAddress: "123 Main St, Kanayannur, Kerala",
        deliveryPerson: {
          name: "Raj Kumar",
          phone: "+91 9876543210",
          rating: 4.8,
          image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
        },
        trackingSteps: [
          { status: "confirmed", time: "2:45 PM", completed: true },
          { status: "preparing", time: "2:50 PM", completed: true },
          { status: "ready", time: "3:10 PM", completed: false },
          { status: "picked_up", time: "3:15 PM", completed: false },
          { status: "delivered", time: "3:25 PM", completed: false }
        ]
      },
      {
        id: "ORD002",
        restaurantName: "Spice Garden",
        restaurantImage: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=100&h=100&fit=crop",
        status: "on_way",
        estimatedTime: "10-15 mins",
        orderTime: "1:30 PM",
        total: 449,
        items: [
          { name: "Chicken Biryani", quantity: 1, price: 249 },
          { name: "Raita", quantity: 1, price: 49 },
          { name: "Gulab Jamun", quantity: 2, price: 75 }
        ],
        deliveryAddress: "456 Park Road, Kanayannur, Kerala",
        deliveryPerson: {
          name: "Priya Singh",
          phone: "+91 9876543211",
          rating: 4.9,
          image: "https://images.unsplash.com/photo-1494790108755-2616b332c776?w=100&h=100&fit=crop"
        },
        trackingSteps: [
          { status: "confirmed", time: "1:30 PM", completed: true },
          { status: "preparing", time: "1:35 PM", completed: true },
          { status: "ready", time: "2:00 PM", completed: true },
          { status: "picked_up", time: "2:05 PM", completed: true },
          { status: "delivered", time: "2:20 PM", completed: false }
        ]
      }
    ],
    history: [
      {
        id: "ORD003",
        restaurantName: "Burger Junction",
        restaurantImage: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=100&h=100&fit=crop",
        status: "delivered",
        orderTime: "Yesterday, 8:30 PM",
        total: 299,
        items: [
          { name: "Classic Burger", quantity: 2, price: 199 },
          { name: "French Fries", quantity: 1, price: 99 }
        ],
        rating: 4.5,
        deliveredTime: "9:15 PM"
      },
      {
        id: "ORD004",
        restaurantName: "Dragon Wok",
        restaurantImage: "https://images.unsplash.com/photo-1512003867696-6d5ce6835040?w=100&h=100&fit=crop",
        status: "delivered",
        orderTime: "Dec 20, 7:45 PM",
        total: 379,
        items: [
          { name: "Fried Rice", quantity: 1, price: 179 },
          { name: "Chow Mein", quantity: 1, price: 199 }
        ],
        rating: 4.2,
        deliveredTime: "8:20 PM"
      }
    ]
  });

  const getStatusColor = (status) => {
    const colors = {
      confirmed: "bg-blue-100 text-blue-800",
      preparing: "bg-yellow-100 text-yellow-800",
      ready: "bg-orange-100 text-orange-800",
      picked_up: "bg-purple-100 text-purple-800",
      on_way: "bg-indigo-100 text-indigo-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status) => {
    const icons = {
      confirmed: CheckCircle,
      preparing: Clock,
      ready: Package,
      picked_up: Truck,
      on_way: Navigation,
      delivered: CheckCircle,
      cancelled: AlertCircle
    };
    const IconComponent = icons[status] || Clock;
    return <IconComponent className="w-5 h-5" />;
  };

  const getStatusText = (status) => {
    const texts = {
      confirmed: "Order Confirmed",
      preparing: "Preparing Food",
      ready: "Ready for Pickup",
      picked_up: "Picked Up",
      on_way: "On the Way",
      delivered: "Delivered",
      cancelled: "Cancelled"
    };
    return texts[status] || status;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">My Orders</h1>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreVertical className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6 max-w-md">
          <button
            onClick={() => setActiveTab("active")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "active"
                ? "bg-white text-red-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Active Orders ({orders.active.length})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === "history"
                ? "bg-white text-red-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Order History
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders List */}
          <div className="lg:col-span-2">
            {activeTab === "active" ? (
              <div className="space-y-4">
                {orders.active.length > 0 ? (
                  orders.active.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <img
                            src={order.restaurantImage}
                            alt={order.restaurantName}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900">
                              {order.restaurantName}
                            </h3>
                            <p className="text-gray-600 text-sm">
                              Order #{order.id}
                            </p>
                            <p className="text-gray-500 text-sm">
                              {order.orderTime}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            <span>{getStatusText(order.status)}</span>
                          </div>
                          <p className="text-lg font-bold text-gray-900 mt-2">
                            ₹{order.total}
                          </p>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              {order.items.length} items
                            </p>
                            <p className="text-sm text-gray-900">
                              {order.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                            </p>
                          </div>
                          {order.status === "on_way" && (
                            <div className="text-right">
                              <p className="text-sm font-medium text-green-600">
                                Arriving in {order.estimatedTime}
                              </p>
                              <button className="text-red-600 text-sm font-medium hover:text-red-700 mt-1">
                                Track Order
                              </button>
                            </div>
                          )}
                          {order.status === "preparing" && (
                            <div className="text-right">
                              <p className="text-sm font-medium text-orange-600">
                                Ready in {order.estimatedTime}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No active orders
                    </h3>
                    <p className="text-gray-600">
                      Your active orders will appear here
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {orders.history.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <img
                          src={order.restaurantImage}
                          alt={order.restaurantName}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">
                            {order.restaurantName}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            Order #{order.id}
                          </p>
                          <p className="text-gray-500 text-sm">
                            {order.orderTime}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span>{getStatusText(order.status)}</span>
                        </div>
                        <p className="text-lg font-bold text-gray-900 mt-2">
                          ₹{order.total}
                        </p>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            {order.items.length} items • Delivered at {order.deliveredTime}
                          </p>
                          <p className="text-sm text-gray-900">
                            {order.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">{order.rating}</span>
                          </div>
                          <div className="flex space-x-2">
                            <button className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors">
                              Reorder
                            </button>
                            <button className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                              Receipt
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Details/Tracking Sidebar */}
          <div className="lg:col-span-1">
            {selectedOrder && activeTab === "active" ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Order Tracking
                  </h2>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </div>

                {/* Delivery Person Info */}
                {selectedOrder.deliveryPerson && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <img
                        src={selectedOrder.deliveryPerson.image}
                        alt={selectedOrder.deliveryPerson.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {selectedOrder.deliveryPerson.name}
                        </h4>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm text-gray-600">
                            {selectedOrder.deliveryPerson.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="flex-1 flex items-center justify-center space-x-2 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                        <Phone className="w-4 h-4" />
                        <span className="text-sm">Call</span>
                      </button>
                      <button className="flex-1 flex items-center justify-center space-x-2 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-sm">Chat</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Tracking Steps */}
                <div className="space-y-4 mb-6">
                  {selectedOrder.trackingSteps.map((step, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                        step.completed 
                          ? "bg-green-100 text-green-600" 
                          : index === selectedOrder.trackingSteps.findIndex(s => !s.completed)
                          ? "bg-orange-100 text-orange-600"
                          : "bg-gray-100 text-gray-400"
                      }`}>
                        {step.completed ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-current" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${
                          step.completed ? "text-gray-900" : "text-gray-500"
                        }`}>
                          {getStatusText(step.status)}
                        </p>
                        <p className="text-xs text-gray-500">{step.time}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery Address */}
                <div className="border-t pt-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        Delivery Address
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedOrder.deliveryAddress}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">
                    {activeTab === "active" 
                      ? "Select an order to view tracking details"
                      : "Order history and receipts"
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};