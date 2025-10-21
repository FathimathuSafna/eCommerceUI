import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  Package,
  AlertCircle,
  Loader2,
  XCircle,
  CreditCard,
} from "lucide-react";
import { getUserOrders, updateOrder } from "../services/orderAPI";
import { Navigation } from "../components/Navigation";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const OrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const navigate = useNavigate();

  const calculateTotal = (cartItems = []) => {
    return cartItems.reduce(
      (sum, item) =>
        sum + (item.foodId?.price || 0) * (item.quantity || 0),
      0
    );
  };

  const splitOrdersByRestaurant = (orderList) => {
    const splitOrders = [];
    
    orderList.forEach((order) => {
      // Gracefully handle if cartIds isn't populated or is empty
      if (!order.cartIds || order.cartIds.length === 0) {
        return;
      }

      const restaurantGroups = {};
      
      order.cartIds.forEach((cartItem) => {
        const restaurantId = cartItem.foodId?.restaurantId?._id;
        const restaurantName = cartItem.foodId?.restaurantId?.restaurantsName;
        
        if (restaurantId) {
          if (!restaurantGroups[restaurantId]) {
            restaurantGroups[restaurantId] = {
              restaurantId: restaurantId,
              restaurantName: restaurantName || "Restaurant",
              items: []
            };
          }
          restaurantGroups[restaurantId].items.push(cartItem);
        }
      });
      
      // Create split orders with unique composite keys
      Object.values(restaurantGroups).forEach((group, index) => {
        splitOrders.push({
          ...order,
          cartIds: group.items,
          restaurantId: group.restaurantId,
          restaurantName: group.restaurantName,
          // Create a unique composite ID for split orders
          compositeId: `${order._id}_${group.restaurantId}`,
          originalOrderId: order._id
        });
      });
    });
    
    return splitOrders;
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await getUserOrders();
        const splitOrdersData = splitOrdersByRestaurant(response.data || []);
        setOrders(splitOrdersData);
        if (splitOrdersData.length > 0) {
          setSelectedOrder(splitOrdersData[0]);
        }
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        toast.error("Could not fetch your orders.");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;

    try {
      setCancellingOrder(selectedOrder.compositeId);
      // Use the original order ID for the API call
      await updateOrder(selectedOrder.originalOrderId || selectedOrder._id, { 
        status: "cancelled" 
      });

      // Update all split orders from the same original order
      setOrders(prevOrders => 
        prevOrders.map(order => 
          (order.originalOrderId || order._id) === (selectedOrder.originalOrderId || selectedOrder._id)
            ? { ...order, status: "cancelled" }
            : order
        )
      );

      setSelectedOrder(prev => ({ ...prev, status: "cancelled" }));
      toast.success("Order cancelled successfully");
      setShowCancelModal(false);
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error("Failed to cancel order. Please try again.");
    } finally {
      setCancellingOrder(null);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-blue-100 text-blue-800",
      preparing: "bg-yellow-100 text-yellow-800",
      Delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };
  
  const getPaymentStatusColor = (status) => {
    const colors = {
      Completed: "bg-green-100 text-green-800",
      Pending: "bg-yellow-100 text-yellow-800",
      Failed: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: Clock,
      preparing: Clock,
      Delivered: CheckCircle,
      cancelled: XCircle,
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-600">Your past orders will appear here.</p>
        </div>
      );
    }

    return orderList.map((order) => {
      const total = calculateTotal(order.cartIds);

      return (
        <div
          key={order.compositeId}
          className={`bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer ${
            selectedOrder?.compositeId === order.compositeId
              ? "border-red-500"
              : "border-gray-200"
          }`}
          onClick={() => setSelectedOrder(order)}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              <img
                src={
                  order.cartIds?.[0]?.foodId?.image ||
                  "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=100&h=100&fit=crop"
                }
                alt={order.restaurantName}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div>
                <h3 className="font-semibold text-lg text-gray-900">
                  {order.restaurantName}
                </h3>
                <p className="text-gray-600 text-sm">
                  Order #{(order.originalOrderId || order._id)?.slice(-6)}
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
              {order.cartIds?.length || 0} items
            </p>
            <p className="text-sm text-gray-900 truncate">
              {order.cartIds
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
                        <p className="text-sm font-medium text-gray-900 mb-1">Restaurant</p>
                        <p className="text-base text-gray-700">{selectedOrder.restaurantName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-1">Status</p>
                        <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                          {getStatusIcon(selectedOrder.status)}
                          <span>{getStatusText(selectedOrder.status)}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-1">Payment</p>
                        <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}>
                          <CreditCard className="w-5 h-5" />
                          <span>{selectedOrder.paymentStatus}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-1">Delivery Address</p>
                        <p className="text-base text-gray-700">{selectedOrder.address}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-2">Items ({selectedOrder.cartIds?.length || 0})</p>
                        <div className="space-y-2 border-t pt-2">
                          {selectedOrder.cartIds?.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span className="text-gray-600">{item.quantity}x {item.foodId?.name || "Item"}</span>
                              <span className="text-gray-900">₹{( (item.foodId?.price || 0) * (item.quantity || 0) ).toFixed(2)}</span>
                            </div>
                          )) || <p className="text-sm text-gray-500">No items</p>}
                        </div>
                      </div>
                      <div className="border-t pt-4">
                        <p className="text-sm font-medium text-gray-900 mb-1">Order Total</p>
                        <p className="text-xl font-bold text-gray-900">₹{calculateTotal(selectedOrder.cartIds).toFixed(2)}</p>
                      </div>
                      {selectedOrder.status === "pending" && (
                        <div className="pt-4 border-t">
                          <button
                            onClick={() => setShowCancelModal(true)}
                            disabled={cancellingOrder === selectedOrder.compositeId}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                          >
                            {cancellingOrder === selectedOrder.compositeId ? (
                              <><Loader2 className="w-5 h-5 animate-spin" /> Cancelling...</>
                            ) : (
                              <><XCircle className="w-5 h-5" /> Cancel Order</>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">Select an order to view details</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Cancel Order</h3>
                <p className="text-sm text-gray-500">Order #{(selectedOrder?.originalOrderId || selectedOrder?._id)?.slice(-6)}</p>
              </div>
            </div>
            <p className="text-gray-600 mb-6">Are you sure you want to cancel this order? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={cancellingOrder === selectedOrder?.compositeId}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition disabled:bg-gray-300"
              >
                {cancellingOrder === selectedOrder?.compositeId ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  "Yes, Cancel"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};