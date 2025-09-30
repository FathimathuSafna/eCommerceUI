import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  Package,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { getUserOrders } from "../services/orderAPI";
import { Navigation } from "../components/Navigation";
import { useNavigate } from "react-router-dom";


export const OrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Function to calculate total price
  const calculateTotal = (items = []) => {
    return items.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
      0
    );
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await getUserOrders();
        setOrders(response.data || []);
        if (response.data?.length > 0) setSelectedOrder(response.data[0]);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-blue-100 text-blue-800",
      preparing: "bg-yellow-100 text-yellow-800",
      Delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: Clock,
      preparing: Clock,
      Delivered: CheckCircle,
      cancelled: AlertCircle,
    };
    const IconComponent = icons[status] || Clock;
    return <IconComponent className="w-5 h-5" />;
  };

  const getStatusText = (status) => {
    const texts = {
      pending: "Order Pending",
      preparing: "Preparing Food",
      Delivered: "Delivered",
      cancelled: "Cancelled",
    };
    return texts[status] || status;
  };

  const renderOrderList = (orderList) => {
    if (!orderList.length) {
      return (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders</h3>
          <p className="text-gray-600">Your orders will appear here.</p>
        </div>
      );
    }

    return orderList.map((order) => {
      const restaurant = order.items?.[0]?.foodId?.restaurantId;
      const total = calculateTotal(order.items);

      return (
        <div
          key={order._id}
          className={`bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer ${
            selectedOrder?._id === order._id
              ? "border-red-500"
              : "border-gray-200"
          }`}
          onClick={() => setSelectedOrder(order)}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              <img
                src={
                  restaurant?.image ||
                  "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=100&h=100&fit=crop"
                }
                alt={restaurant?.restaurantsName || "Restaurant"}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div>
                <h3 className="font-semibold text-lg text-gray-900">
                  {restaurant?.restaurantsName || "Restaurant"}
                </h3>
                <p className="text-gray-600 text-sm">
                  Order #{order._id?.slice(-6)}
                </p>
                <p className="text-gray-500 text-sm">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div
                className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  order.status
                )}`}
              >
                {getStatusIcon(order.status)}
                <span>{getStatusText(order.status)}</span>
              </div>
              <p className="text-lg font-bold text-gray-900 mt-2">
                ₹{total.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="border-t pt-4">
            <p className="text-sm text-gray-600 mb-1">
              {order.items?.length || 0} items
            </p>
            <p className="text-sm text-gray-900 truncate">
              {order.items
                ?.map(
                  (item) => `${item.quantity}x ${item.foodId?.name || "Item"}`
                )
                .join(", ") || "No items"}
            </p>
          </div>
        </div>
      );
    });
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50">
        {/* <header className="bg-white shadow-sm border-b sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" onClick={() => navigate("/")}>
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-lg font-semibold text-gray-800">My Orders</h1>
              </div>
            </div>
          </div>
        </header> */}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            className="flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors text-gray-800 font-medium mb-4"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            Back
          </button>

          {loading ? (
            <div className="text-center py-12 flex flex-col items-center justify-center">
              <Loader2 className="w-12 h-12 text-red-500 animate-spin mb-4" />
              <p className="text-gray-500">Loading your orders...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {renderOrderList(orders)}
              </div>

              <div className="lg:col-span-1">
                {selectedOrder ? (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">
                      Order Details
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          Status
                        </p>
                        <div
                          className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            selectedOrder.status
                          )}`}
                        >
                          {getStatusIcon(selectedOrder.status)}
                          <span>{getStatusText(selectedOrder.status)}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-2">
                          Items ({selectedOrder.items?.length || 0})
                        </p>
                        <div className="space-y-2 border-t pt-2">
                          {selectedOrder.items?.map((item, index) => (
                            <div
                              key={index}
                              className="flex justify-between text-sm"
                            >
                              <span className="text-gray-600">
                                {item.quantity}x {item.foodId?.name || "Item"}
                              </span>
                              <span className="text-gray-900">
                                ₹
                                {(
                                  (item.price || 0) * (item.quantity || 0)
                                ).toFixed(2)}
                              </span>
                            </div>
                          )) || (
                            <p className="text-sm text-gray-500">No items</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          Order Total
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          ₹{calculateTotal(selectedOrder.items).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">
                        Select an order to view details
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
