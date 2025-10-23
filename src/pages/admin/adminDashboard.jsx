import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Store,
  UtensilsCrossed,
  Users,
  ShoppingBag,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Menu,
  X,
  Save,
  FileText, // For invoice icon
  Printer, // For print icon
  Download, // For download icon
} from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  addRestaurants,
  updateRestaurant,
  deleteRestaurant,
  getAllRestaurants,
  addFoodItem,
  getAllFoodItems,
  updateFoodItem,
  deleteFoodItem,
} from "../../services/adminAPI";
import { getAllUsers, deleteUser } from "../../services/userApi";
import {
  getAllOrders,
  deleteOrder,
  updateOrder,
} from "../../services/orderAPI";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../store/supabaseClient";
import jsPDF from "jspdf";
import html2canvas from "html2canvas"; // Still needed for window.print()

// --- Helper: Draws one invoice onto a jsPDF instance ---
const drawInvoiceOnPage = (pdf, order, options = {}) => {
  try {
    const { startY = 0 } = options; // Get the starting Y position
    const margin = 15;
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();

    const sectionHeight = 148;
    const sectionBottom = startY + sectionHeight;
    const itemPageBreakLimit = sectionBottom - 35;

    // --- Column X Positions ---
    const itemX = margin;
    const qtyX = 120;
    const priceX = 155;
    const totalX = pageW - margin;

    // --- Title (Left) ---
    let titleY = margin + 10 + startY;
    pdf.setFontSize(24);
    pdf.setFont("helvetica", "bold");
    pdf.text("FoodAdmin", margin, titleY);
    titleY += 7;
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text("Kochi, Kerala", margin, titleY);

    // --- Order Details (Right) ---
    let headerY = margin + 10 + startY;
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");

    if (order.isMergedInvoice) {
      pdf.text("Daily Summary", pageW - margin, headerY, { align: "right" });
    } else {
      pdf.text(
        `Order #${order.id.slice(-6).toUpperCase()}`,
        pageW - margin,
        headerY,
        { align: "right" }
      );
    }

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    headerY += 7;
    pdf.text(
      `Date: ${new Date(order.createdAt).toLocaleDateString("en-IN")}`,
      pageW - margin,
      headerY,
      { align: "right" }
    );

    // --- Start Y for content ---
    let y = Math.max(titleY, headerY) + 15;

    // --- Bill To ---
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.text("Bill To:", margin, y);
    y += 6;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text(order.customerName, margin, y);
    y += 5;
    pdf.text(order.address, margin, y, { maxWidth: 80 });
    y += 15;

    // --- Table Header ---
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.text("Item", itemX, y);
    pdf.text("Qty", qtyX, y, { align: "center" });
    pdf.text("Price", priceX, y, { align: "right" });
    pdf.text("Total", totalX, y, { align: "right" });
    y += 3;
    pdf.setDrawColor(180, 180, 180);
    pdf.line(margin, y, pageW - margin, y);
    y += 7;

    // --- Table Items ---
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    let totalAmount = 0;
    let itemsTruncated = false;
    order.items.forEach((item) => {
      if (itemsTruncated) return;

      if (y > itemPageBreakLimit) {
        pdf.text("...items truncated.", itemX, y);
        itemsTruncated = true;
        return;
      }

      const itemTotal = item.price * item.quantity;
      totalAmount += itemTotal;

      pdf.text(item.name, itemX, y, { maxWidth: 100 });
      pdf.text(item.quantity.toString(), qtyX, y, { align: "center" });
      pdf.text(`₹${item.price.toFixed(2)}`, priceX, y, { align: "right" });
      pdf.text(`₹${itemTotal.toFixed(2)}`, totalX, y, { align: "right" });
      y += 7;
    });

    // --- Table Footer Line ---
    y += 2;
    pdf.line(margin, y, pageW - margin, y);
    y += 8;

    // --- Footer Totals ---
    const subtotalStr = `Subtotal: ₹${totalAmount.toFixed(2)}`;
    const totalStr = `Total: ₹${totalAmount.toFixed(2)}`;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text(subtotalStr, totalX, y, { align: "right" });
    y += 7;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.text(totalStr, totalX, y, { align: "right" });

    // --- Separator Line ---
    if (startY < 10) { // Only draw for the top invoice
      y = sectionBottom - 2;
      pdf.setDrawColor(180, 180, 180);
      pdf.setLineDash([2, 2], 0); // Dashed line
      pdf.line(margin, y, pageW - margin, y);
      pdf.setLineDash([], 0); // Reset line dash
    }

  } catch (error) {
    console.error(`Failed to draw invoice for order ${order.id}:`, error);
    if (pdf.internal.pages.length > 1) pdf.addPage();
    pdf.text("Error generating invoice for order:", 10, 10);
    pdf.text(order.id, 10, 20);
    pdf.text(error.message, 10, 30);
  }
};

// --- Main Admin Dashboard Component ---
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modal states
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddRestaurantModal, setShowAddRestaurantModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [showEditRestaurantModal, setShowEditRestaurantModal] = useState(false);
  const [showEditOrderModal, setShowEditOrderModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showBatchViewerModal, setShowBatchViewerModal] = useState(false);

  // Data states
  const [restaurantsData, setRestaurantsData] = useState([]);
  const [productsData, setProductsData] = useState([]);
  const [ordersData, setOrdersData] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);
  const [filteredBatchOrders, setFilteredBatchOrders] = useState([]);

  // State for date filtering
  const [reportDate, setReportDate] = useState("");

  // State to trigger data re-fetches
  const [restaurantDataVersion, setRestaurantDataVersion] = useState(0);
  const [productDataVersion, setProductDataVersion] = useState(0);
  const [orderDataVersion, setOrderDataVersion] = useState(0);
  const [userDataVersion, setUserDataVersion] = useState(0);

  // Effect for fetching Restaurants
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await getAllRestaurants();
        setRestaurantsData(
          response.data.map((item) => ({ ...item, id: item._id }))
        );
      } catch (error) {
        console.error("Failed to fetch restaurants:", error);
      }
    };
    fetchRestaurants();
  }, [restaurantDataVersion]);

  // Effect for fetching Products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getAllFoodItems();
        setProductsData(
          response.data.map((item) => ({
            ...item,
            id: item._id,
            restaurant: item.restaurantId?.restaurantsName || "N/A",
            restaurantId: item.restaurantId?._id || null,
          }))
        );
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };
    fetchProducts();
  }, [productDataVersion]);

  // Effect for fetching Orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await getAllOrders();
        const formattedOrders = response.data.map((order) => {
          const items =
            order.cartIds?.map((cartItem) => ({
              name: cartItem.foodId?.name || "N/A",
              price: cartItem.foodId?.price || 0,
              quantity: cartItem.quantity,
              restaurantName:
                cartItem.foodId?.restaurantId?.restaurantsName || "N/A",
            })) || [];

          const foodItemDisplay = items
            .map((item) => `${item.name} (x${item.quantity})`)
            .join(", ");

          const restaurantNames = [
            ...new Set(items.map((i) => i.restaurantName)),
          ].join(", ");

          const totalAmount = items.reduce(
            (sum, i) => sum + i.price * i.quantity,
            0
          );

          return {
            id: order._id,
            userId: order.userId?._id || null,
            customerName:
              order.userId?.fullName || order.userId?.email || "Guest",
            address: order.address || "N/A",
            items: items,
            foodItemDisplay: foodItemDisplay,
            restaurantName: restaurantNames,
            amount: `₹${totalAmount.toFixed(2)}`,
            status: order.status || "Delivered",
            createdAt: new Date(order.createdAt),
            createdAtFormatted: new Date(order.createdAt).toLocaleString("en-IN"),
          };
        });
        setOrdersData(formattedOrders);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      }
    };
    fetchOrders();
  }, [orderDataVersion]);

  // Effect for fetching Users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAllUsers();
        setUsersData(
          response.data.map((user) => ({
            ...user,
            id: user._id,
            name: user.fullName || "N/A",
            createdAt: new Date(user.createdAt).toLocaleDateString("en-IN"),
          }))
        );
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };
    fetchUsers();
  }, [userDataVersion]);

  // --- Handlers ---
  const handleViewInvoice = (order) => {
    setCurrentItem(order);
    setShowInvoiceModal(true);
  };

  const handleDownloadInvoice = (order) => {
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      drawInvoiceOnPage(pdf, order, { startY: 0 });
      const fileName = order.isMergedInvoice
        ? `summary-${order.customerName}-${reportDate || "invoice"}.pdf`
        : `invoice-${order.id.slice(-6)}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("Failed to generate PDF invoice:", error);
      alert("Failed to generate PDF invoice.");
    }
  };

  const handleShowBatchViewer = () => {
    if (!reportDate) {
      alert("Please select a date.");
      return;
    }

    const selectedDate = new Date(reportDate);
    selectedDate.setHours(0, 0, 0, 0);
    const endOfDay = new Date(reportDate);
    endOfDay.setHours(23, 59, 59, 999);

    const filteredOrders = ordersData.filter((order) => {
      return (
        order.status === "Delivered" &&
        order.createdAt >= selectedDate &&
        order.createdAt <= endOfDay &&
        order.userId
      );
    });

    if (filteredOrders.length === 0) {
      alert(
        "No 'Delivered' orders with associated users found for the selected date."
      );
      return;
    }

    const groupedByUser = new Map();
    filteredOrders.forEach((order) => {
      if (!groupedByUser.has(order.userId)) {
        groupedByUser.set(order.userId, {
          id: `user-${order.userId}-date-${reportDate}`,
          customerName: order.customerName,
          address: order.address,
          userId: order.userId,
          items: [],
          createdAt: order.createdAt,
          createdAtFormatted: new Date(order.createdAt).toLocaleDateString("en-IN"),
          status: "Delivered",
          isMergedInvoice: true,
        });
      }
      const mergedInvoice = groupedByUser.get(order.userId);
      mergedInvoice.items.push(...order.items);
    });

    const mergedInvoices = Array.from(groupedByUser.values());
    setFilteredBatchOrders(mergedInvoices);
    setShowBatchViewerModal(true);
  };

  const handleBatchInvoiceDownload = () => {
    if (filteredBatchOrders.length === 0) {
      console.error("No orders selected for batch download.");
      setShowBatchViewerModal(false);
      return;
    }

    try {
      const pdf = new jsPDF("p", "mm", "a4");
      filteredBatchOrders.forEach((order, index) => {
        const pageIndex = Math.floor(index / 2);
        const positionOnPage = index % 2;
        if (pageIndex > 0 && positionOnPage === 0) {
          pdf.addPage();
        }
        const startY = positionOnPage * 148;
        drawInvoiceOnPage(pdf, order, { startY: startY });
      });
      pdf.save(`daily-summaries-${reportDate}.pdf`);
    } catch (error) {
      console.error("Failed to generate batch PDF invoices:", error);
      alert("Failed to generate batch PDF invoices.");
    }

    setShowBatchViewerModal(false);
    setFilteredBatchOrders([]);
  };

  const handleEdit = (item, type) => {
    if (
      type === "order" &&
      (item.status === "Cancelled" || item.status === "Pending")
    ) {
      alert(`${item.status} orders cannot be edited.`);
      return;
    }
    setCurrentItem(item);
    if (type === "product") setShowEditProductModal(true);
    if (type === "restaurant") setShowEditRestaurantModal(true);
    if (type === "order") setShowEditOrderModal(true);
  };

  const handleDelete = (item, type) => {
    setCurrentItem({ ...item, type });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!currentItem?.id) return;
    try {
      switch (currentItem.type) {
        case "product":
          await deleteFoodItem(currentItem.id);
          setProductDataVersion((v) => v + 1);
          break;
        case "restaurant":
          await deleteRestaurant(currentItem.id);
          setRestaurantDataVersion((v) => v + 1);
          break;
        case "order":
          await deleteOrder(currentItem.id);
          setOrderDataVersion((v) => v + 1);
          break;
        case "user":
          await deleteUser(currentItem.id);
          setUserDataVersion((v) => v + 1);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error("Failed to delete item:", error);
    } finally {
      setShowDeleteModal(false);
      setCurrentItem(null);
    }
  };

  const handleAddOrUpdate = async (itemData, type, imageFile = null) => {
    try {
      let submissionData = { ...itemData };
      if (imageFile) {
        const filePath = `${type}-images/${Date.now()}-${imageFile.name}`;
        const { error, data } = await supabase.storage
          .from("images")
          .upload(filePath, imageFile);
        if (error) throw error;
        submissionData.image = supabase.storage
          .from("images")
          .getPublicUrl(data.path).data.publicUrl;
      }

      if (type === "product") {
        await (submissionData.id
          ? updateFoodItem(submissionData.id, submissionData)
          : addFoodItem(submissionData));
        setProductDataVersion((v) => v + 1);
      } else if (type === "restaurant") {
        await (submissionData.id
          ? updateRestaurant(submissionData.id, submissionData)
          : addRestaurants(submissionData));
        setRestaurantDataVersion((v) => v + 1);
      } else if (type === "order") {
        await updateOrder(submissionData.id, { status: submissionData.status });
        setOrderDataVersion((v) => v + 1);
      }
    } catch (error) {
      console.error(`Failed to save ${type}:`, error);
    }
    setShowAddProductModal(false);
    setShowEditProductModal(false);
    setShowAddRestaurantModal(false);
    setShowEditRestaurantModal(false);
    setShowEditOrderModal(false);
    setCurrentItem(null);
  };

  // --- UI Data & Helpers ---
  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "restaurants", label: "Restaurants", icon: Store },
    { id: "products", label: "Products", icon: UtensilsCrossed },
    { id: "orders", label: "Orders", icon: ShoppingBag },
    { id: "users", label: "Users", icon: Users },
  ];

  const stats = [
    { title: "Total Orders", value: ordersData.length },
    { title: "Restaurants", value: restaurantsData.length },
    { title: "Products", value: productsData.length },
    { title: "Users", value: usersData.length },
  ];

  const recentOrders = ordersData.slice(0, 5);

  const getStatusBadge = (status) => {
    const statusColors = {
      Delivered: "bg-green-100 text-green-800",
      Preparing: "bg-yellow-100 text-yellow-800",
      Pending: "bg-blue-100 text-blue-800",
      Cancelled: "bg-red-100 text-red-800",
      Active: "bg-green-100 text-green-800",
      true: "bg-green-100 text-green-800",
      Inactive: "bg-red-100 text-red-800",
      false: "bg-red-100 text-red-800",
    };
    return `px-3 py-1 rounded-full text-sm font-medium ${
      statusColors[status] || "bg-gray-100 text-gray-800"
    }`;
  };

  // --- Content Renderer ---
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardView
            stats={stats}
            recentOrders={recentOrders}
            getStatusBadge={getStatusBadge}
          />
        );
      case "restaurants":
        return (
          <TableView
            title="Restaurants"
            data={restaurantsData}
            columns={["Restaurant", "Cuisine", "Description", "Status"]}
            dataKeys={["restaurantsName", "cuisine", "description", "isActive"]}
            statusKey="isActive"
            getStatusBadge={getStatusBadge}
            onAdd={() => setShowAddRestaurantModal(true)}
            onEdit={(item) => handleEdit(item, "restaurant")}
            onDelete={(item) => handleDelete(item, "restaurant")}
          />
        );
      case "products":
        return (
          <TableView
            title="Products"
            data={productsData}
            columns={["Product", "Restaurant", "Category", "Price", "Status"]}
            dataKeys={[
              "name",
              "restaurant",
              "category",
              "price",
              "isAvailable",
            ]}
            statusKey="isAvailable"
            getStatusBadge={getStatusBadge}
            onAdd={() => setShowAddProductModal(true)}
            onEdit={(item) => handleEdit(item, "product")}
            onDelete={(item) => handleDelete(item, "product")}
          />
        );
      case "orders":
        return (
          <TableView
            title="Orders"
            data={ordersData}
            columns={[
              "Order ID",
              "Customer",
            	"Address",
            	"Food Item",
            	"Amount",
          	  "Status",
          	  "Date",
          	]}
          	dataKeys={[
          	  "id",
          	  "customerName",
          	  "address",
          	  "foodItemDisplay",
          	  "amount",
          	  "status",
          	  "createdAtFormatted",
          	]}
          	statusKey="status"
          	getStatusBadge={getStatusBadge}
          	onEdit={(item) => handleEdit(item, "order")}
          	onDelete={(item) => handleDelete(item, "order")}
          	onViewInvoice={(item) => handleViewInvoice(item)}
          	reportDate={reportDate}
          	setReportDate={setReportDate}
          	onDownloadBatchInvoices={handleShowBatchViewer}
        	/>
      	);
    	case "users":
      	return (
        	<TableView
          	title="Users"
          	data={usersData}
          	columns={["Name", "Email", "Phone", "Joined Date"]}
          	dataKeys={["name", "email", "phoneNumber", "createdAt"]}
          	onDelete={(item) => handleDelete(item, "user")}
        	/>
      	);
    	default:
      	return (
        	<div className="text-center p-10 text-gray-500">
          	Content for {activeTab} coming soon...
        	</div>
      	);
  	}
  };

  return (
  	<div className="relative min-h-screen bg-gray-100">
    	<Sidebar
      	sidebarItems={sidebarItems}
      	activeTab={activeTab}
      	setActiveTab={setActiveTab}
      	sidebarOpen={sidebarOpen}
      	setSidebarOpen={setSidebarOpen}
    	/>
    	<div className="lg:ml-64">
      	<Header activeTab={activeTab} setSidebarOpen={setSidebarOpen} />
      	<main className="p-4 sm:p-6">{renderContent()}</main>
    	</div>

    	<ProductModal
      	isOpen={showAddProductModal || showEditProductModal}
      	onClose={() => {
        	setShowAddProductModal(false);
        	setShowEditProductModal(false);
        	setCurrentItem(null);
      	}}
      	product={currentItem}
      	onSave={(p, f) => handleAddOrUpdate(p, "product", f)}
      	restaurants={restaurantsData}
    	/>
    	<RestaurantModal
      	isOpen={showAddRestaurantModal || showEditRestaurantModal}
      	onClose={() => {
        	setShowAddRestaurantModal(false);
        	setShowEditRestaurantModal(false);
        	setCurrentItem(null);
      	}}
      	restaurant={currentItem}
      	onSave={(r, f) => handleAddOrUpdate(r, "restaurant", f)}
    	/>
    	<OrderModal
      	isOpen={showEditOrderModal}
      	onClose={() => {
        	setShowEditOrderModal(false);
        	setCurrentItem(null);
      	}}
      	order={currentItem}
      	onSave={(o) => handleAddOrUpdate(o, "order")}
    	/>
    	<DeleteConfirmationModal
      	isOpen={showDeleteModal}
      	onClose={() => setShowDeleteModal(false)}
      	onConfirm={confirmDelete}
      	itemName={
        	currentItem?.restaurantsName ||
        	currentItem?.name ||
        	currentItem?.fullName ||
        	currentItem?.id
      	}
    	/>
    	<BatchInvoiceViewerModal
      	isOpen={showBatchViewerModal}
      	onClose={() => {
        	setShowBatchViewerModal(false);
        	setFilteredBatchOrders([]);
      	}}
      	onConfirm={handleBatchInvoiceDownload}
      	orders={filteredBatchOrders}
      	onDownloadIndividual={handleDownloadInvoice}
    	/>
    	<InvoiceModal
      	isOpen={showInvoiceModal}
      	onClose={() => {
        	setShowInvoiceModal(false);
        	setCurrentItem(null);
      	}}
      	order={currentItem}
      	onDownload={handleDownloadInvoice}
    	/>
  	</div>
  );
};

// --- Sub-components ---
// Sidebar, Header, DashboardView remain unchanged from previous correct versions

const Sidebar = ({
  sidebarItems,
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen,
}) => {
  const navigate = useNavigate();
  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden transition-opacity ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      ></div>
      <div
        className={`fixed top-0 left-0 h-full bg-white shadow-xl z-40 w-64 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 flex items-center space-x-3">
          <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
            <UtensilsCrossed className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">FoodAdmin</h1>
        </div>
        <nav className="mt-8">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-50 transition-colors ${
                activeTab === item.id
                  ? "bg-red-50 text-red-600 border-r-4 border-red-500"
                  : "text-gray-700"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="ml-3">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 w-full p-6">
          <button
            onClick={() => {
              localStorage.removeItem("adminToken");
              navigate("/admin/login");
            }}
            className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="ml-3">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

const Header = ({ activeTab, setSidebarOpen }) => (
  <header className="bg-white border-b px-4 sm:px-6 py-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-xl sm:text-2xl font-semibold capitalize">
          {activeTab}
        </h1>
      </div>
      <div className="flex items-center space-x-3">
        <div className="hidden md:block">
          <p className="text-sm font-medium">Admin User</p>
        </div>
      </div>
    </div>
  </header>
);

const DashboardView = ({ stats, recentOrders, getStatusBadge }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <div key={i} className="bg-white p-6 rounded-xl shadow-sm border">
          <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
          <p className="text-2xl font-bold mt-1">{stat.value}</p>
        </div>
      ))}
    </div>
    <div className="bg-white rounded-xl shadow-sm border">
      <h2 className="text-lg font-semibold p-6 border-b">Recent Orders</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {["Order ID", "Customer", "Restaurant", "Amount", "Status"].map(
                (h) => (
                  <th
                    key={h}
                    className="text-left py-3 px-6 text-sm font-medium text-gray-700"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => (
              <tr key={order.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-6 text-sm font-medium truncate max-w-xs">
                  {order.id}
                </td>
                <td className="py-3 px-6 text-sm truncate max-w-xs">
                  {order.customerName}
                </td>
                <td className="py-3 px-6 text-sm">{order.restaurantName}</td>
                <td className="py-3 px-6 text-sm font-semibold">
                  {order.amount}
                </td>
                <td className="py-3 px-6">
                  <span className={getStatusBadge(order.status)}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

// TableView includes updated button styles
const TableView = ({
  title,
  data,
  columns,
  dataKeys,
  onAdd,
  onEdit,
  onDelete,
  onViewInvoice,
  getStatusBadge,
  statusKey,
  // Props for batch invoice download
  reportDate,
  setReportDate,
  onDownloadBatchInvoices,
}) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      {onAdd && (
        <button
          onClick={onAdd}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 text-sm rounded-lg font-medium flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add {title.slice(0, -1)}</span>
        </button>
      )}
    </div>

    {/* Block for Date Filtering & Batch Invoice Download */}
    {onDownloadBatchInvoices && (
      <div className="bg-white p-4 rounded-xl shadow-sm border flex flex-wrap items-end gap-4">
        <div>
          <label
            htmlFor="reportDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Select Date for Delivered Invoices
          </label>
          <input
            id="reportDate"
            type="date"
            value={reportDate}
            onChange={(e) => setReportDate(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-red-500 border-gray-300"
          />
        </div>
        <button
          onClick={onDownloadBatchInvoices}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 text-sm rounded-lg font-medium flex items-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>Download Invoices</span>
        </button>
      </div>
    )}

    <div className="bg-white rounded-xl shadow-sm border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((c) => (
                <th
                  key={c}
                  className="text-left py-3 px-6 text-sm font-medium text-gray-700"
                >
                  {c}
                </th>
              ))}
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                {dataKeys.map((key) => (
                  <td
                    key={`${item.id}-${key}`}
                    className="py-3 px-6 text-sm text-gray-700 truncate max-w-xs"
                  >
                    {key === statusKey ? (
                      <span className={getStatusBadge(item[key])}>{`${item[key]}`}</span>
                    ) : Array.isArray(item[key]) ? (
                      item[key].join(", ")
                    ) : (
                      item[key]
                    )}
                  </td>
                ))}
                <td className="py-3 px-6">
                  <div className="flex items-center space-x-2">
                    {onViewInvoice && (
                      <button
                        onClick={() => onViewInvoice(item)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="View Invoice"
                      >
                        <FileText className="w-4 h-4 text-blue-500" />
                      </button>
                    )}
                    {onEdit && (
                      <button
                        onClick={() => onEdit(item)}
                        disabled={
                          item.status === "Cancelled" ||
                          item.status === "Pending"
                        }
                        className={`p-1 rounded ${
                          item.status === "Cancelled" ||
                          item.status === "Pending"
                            ? "cursor-not-allowed opacity-50"
                            : "hover:bg-gray-100"
                        }`}
                        title="Edit"
                      >
                        <Edit className="w-4 h-4 text-gray-500" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(item)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

// InvoiceModal includes updated button styles
const InvoiceModal = ({ isOpen, onClose, order, onDownload }) => {
  if (!isOpen) return null;

  const totalAmount = order?.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header with icons */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Invoice
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onDownload(order)}
              className="p-1.5 hover:bg-gray-100 rounded-lg"
              title="Download PDF"
            >
              <Download className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => window.print()}
              className="p-1.5 hover:bg-gray-100 rounded-lg"
              title="Print"
            >
              <Printer className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={onClose}
            	className="p-1.5 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div id="invoice-content" className="p-6 overflow-y-auto">
          {/* Top Section */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">FoodAdmin</h1>
              <p className="text-sm text-gray-500">Kochi, Kerala</p>
            </div>
            <div className="text-right">
              <h2 className="text-lg font-bold text-gray-700">
                Order #{order?.id.slice(-6).toUpperCase()}
            	</h2>
            	<p className="text-sm text-gray-500">
              	Date: {new Date(order?.createdAt).toLocaleDateString("en-IN")}
            	</p>
          	</div>
        	</div>

        	{/* Bill To */}
        	<div className="mb-8">
          	<h3 className="font-bold text-gray-800 mb-1">Bill To:</h3>
          	<p className="text-gray-600">{order?.customerName}</p>
          	<p className="text-gray-600">{order?.address}</p>
        	</div>

        	{/* Items Table */}
        	<table className="w-full mb-6">
          	<thead>
            	<tr className="border-b border-t border-gray-300">
              	<th className="text-left p-2 text-sm font-bold text-gray-700">Item</th>
              	<th className="text-center p-2 text-sm font-bold text-gray-700">Qty</th>
              	<th className="text-right p-2 text-sm font-bold text-gray-700">Price</th>
              	<th className="text-right p-2 text-sm font-bold text-gray-700">Total</th>
            	</tr>
          	</thead>
          	<tbody>
            	{order?.items.map((item, index) => (
              	<tr key={index}>
                	<td className="p-2">{item.name}</td>
                	<td className="p-2 text-center">{item.quantity}</td>
                	<td className="p-2 text-right">₹{item.price.toFixed(2)}</td>
                	<td className="p-2 text-right">
                  	₹{(item.price * item.quantity).toFixed(2)}
                	</td>
              	</tr>
            	))}
            	<tr className="border-t border-gray-300">
              	<td colSpan="4"></td>
            	</tr>
          	</tbody>
        	</table>

        	{/* Totals */}
        	<div className="text-right space-y-1">
          	<p className="text-gray-600">Subtotal: ₹{totalAmount?.toFixed(2)}</p>
          	<p className="text-xl font-bold text-gray-900 mt-1">Total: ₹{totalAmount?.toFixed(2)}</p>
        	</div>
      	</div>
      </div>
    </div>
  );
};

// OrderModal includes updated button styles
const OrderModal = ({ isOpen, onClose, order, onSave }) => {
  const formik = useFormik({
    initialValues: { status: order?.status || "Pending" },
    enableReinitialize: true,
    onSubmit: (values) => {
      onSave({ ...order, ...values });
    },
  });

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Order #${order?.id.slice(-6)}`}
    >
      <form onSubmit={formik.handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Customer</label>
          <input
            type="text"
            value={order?.customerName || ""}
            disabled
            className="w-full px-4 py-2 border rounded-lg bg-gray-100"
          />
        </div>
        <TextareaField
          label="Shipping Address"
          value={order?.address || "N/A"}
          disabled
        	className="w-full px-4 py-2 border rounded-lg bg-gray-100"
      	/>
      	<SelectField
        	label="Order Status"
        	name="status"
        	{...formik.getFieldProps("status")}
        	options={[
          	{ label: "Pending", value: "Pending" },
          	{ label: "Preparing", value: "Preparing" },
      	  { label: "Delivered", value: "Delivered" },
        	  { label: "Cancelled", value: "Cancelled" },
      	]}
      	/>
      	<div className="flex justify-end space-x-4 pt-6">
        	<button
          	type="button"
          	onClick={onClose}
          	className="px-4 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        	>
          	Cancel
        	</button>
        	<button
          	type="submit"
          	className="px-4 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center space-x-2"
        	>
          	<Save className="w-4 h-4" />
          	<span>Update Order</span>
        	</button>
      	</div>
      </form>
    </FormModal>
  );
};

// FormModal includes updated button styles
const FormModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// ProductModal includes updated button styles
const ProductModal = ({
  isOpen,
  onClose,
  product,
  onSave,
  restaurants = [],
}) => {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    setImagePreview(product?.image || null);
    setImageFile(null);
  }, [product]);

  const handleImageChange = (e) => {
  	if (e.currentTarget.files?.[0]) {
      const file = e.currentTarget.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
  	}
  };

  const formik = useFormik({
    initialValues: {
      name: product?.name || "",
      description: product?.description || "",
      price: product?.price || "",
      category: product?.category || "",
      restaurantId: product?.restaurantId || "",
      isAvailable: product?.isAvailable ?? true,
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Required"),
      price: Yup.number().positive().required("Required"),
      category: Yup.string().required("Required"),
      restaurantId: Yup.string().required("Required"),
    }),
    enableReinitialize: true,
  	onSubmit: (values) => onSave({ ...product, ...values }, imageFile),
  });

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={product ? "Edit Product" : "Add Product"}
    >
      <form onSubmit={formik.handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <InputField
            label="Product Name"
            name="name"
            {...formik.getFieldProps("name")}
            error={formik.touched.name && formik.errors.name}
          />
          <InputField
            label="Price"
            name="price"
            type="number"
            {...formik.getFieldProps("price")}
            error={formik.touched.price && formik.errors.price}
          />
        </div>
        <TextareaField
          label="Description"
          name="description"
          {...formik.getFieldProps("description")}
        />
        <div>
          <label className="block text-sm font-medium mb-2">Image</label>
          <div className="flex items-center gap-4">
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="w-20 h-20 rounded-md object-cover"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
            />
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <SelectField
            label="Category"
            name="category"
            {...formik.getFieldProps("category")}
            options={[
              "Biriyani",
              "Drinks",
              "Dessert",
              "Main Course",
            	"Appetizers",
          	].map((c) => ({ label: c, value: c }))}
          	error={formik.touched.category && formik.errors.category}
        	/>
        	<SelectField
          	label="Restaurant"
          	name="restaurantId"
          	{...formik.getFieldProps("restaurantId")}
          	options={restaurants.map((r) => ({
            	label: r.restaurantsName,
            	value: r.id,
          	}))}
          	error={formik.touched.restaurantId && formik.errors.restaurantId}
        	/>
        	<SelectField
          	label="Status"
          	name="isAvailable"
          	value={formik.values.isAvailable}
          	onChange={(e) =>
            	formik.setFieldValue("isAvailable", e.target.value === "true")
          	}
          	options={[
          	  { label: "Available", value: true },
          	  { label: "Unavailable", value: false },
          	]}
        	/>
      	</div>
      	<div className="flex justify-end space-x-4 pt-6">
        	<button
          	type="button"
          	onClick={onClose}
          	className="px-4 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        	>
          	Cancel
        	</button>
        	<button
          	type="submit"
          	className="px-4 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center space-x-2"
        	>
          	<Save className="w-4 h-4" />
          	<span>Save</span>
        	</button>
      	</div>
      </form>
    </FormModal>
  );
};

// RestaurantModal includes updated button styles
const RestaurantModal = ({ isOpen, onClose, restaurant, onSave }) => {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    setImagePreview(restaurant?.image || null);
    setImageFile(null);
  }, [restaurant]);

  const handleImageChange = (e) => {
  	if (e.currentTarget.files?.[0]) {
    	const file = e.currentTarget.files[0];
    	setImageFile(file);
    	setImagePreview(URL.createObjectURL(file));
  	}
  };

  const formik = useFormik({
    initialValues: {
      restaurantsName: restaurant?.restaurantsName || "",
      description: restaurant?.description || "",
      cuisine: Array.isArray(restaurant?.cuisine)
        ? restaurant.cuisine.join(", ")
        : "",
      isActive: restaurant?.isActive ?? true,
    },
    validationSchema: Yup.object({
      restaurantsName: Yup.string().required("Required"),
      cuisine: Yup.string().required("Required"),
    }),
    enableReinitialize: true,
    onSubmit: (values) =>
      onSave(
        {
          ...restaurant,
          ...values,
          cuisine: values.cuisine.split(",").map((c) => c.trim()),
        },
        imageFile
      ),
  });

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={restaurant ? "Edit Restaurant" : "Add Restaurant"}
    >
      <form onSubmit={formik.handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <InputField
            label="Restaurant Name"
            name="restaurantsName"
            {...formik.getFieldProps("restaurantsName")}
          	error={
          	  formik.touched.restaurantsName && formik.errors.restaurantsName
          	}
        	/>
        	<InputField
          	label="Cuisine (comma-separated)"
          	name="cuisine"
          	{...formik.getFieldProps("cuisine")}
          	error={formik.touched.cuisine && formik.errors.cuisine}
        	/>
      	</div>
      	<TextareaField
        	label="Description"
        	name="description"
        	{...formik.getFieldProps("description")}
      	/>
      	<div>
        	<label className="block text-sm font-medium mb-2">Image</label>
        	<div className="flex items-center gap-4">
          	{imagePreview && (
            	<img
              	src={imagePreview}
              	alt="Preview"
              	className="w-20 h-20 rounded-md object-cover"
            	/>
          	)}
          	<input
            	type="file"
            	accept="image/*"
            	onChange={handleImageChange}
            	className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
          	/>
        	</div>
      	</div>
      	<SelectField
        	label="Status"
        	name="isActive"
        	value={formik.values.isActive}
        	onChange={(e) =>
        	  formik.setFieldValue("isActive", e.target.value === "true")
      	}
      	options={[
        	  { label: "Active", value: true },
        	  { label: "Inactive", value: false },
      	]}
      	/>
      	<div className="flex justify-end space-x-4 pt-6">
        	<button
          	type="button"
          	onClick={onClose}
          	className="px-4 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        	>
          	Cancel
        	</button>
        	<button
          	type="submit"
          	className="px-4 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center space-x-2"
        	>
          	<Save className="w-4 h-4" />
          	<span>Save</span>
        	</button>
      	</div>
      </form>
    </FormModal>
  );
};

// DeleteConfirmationModal includes updated button styles
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, itemName }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-8 max-w-sm w-full">
        <h3 className="text-lg font-bold">Confirm Deletion</h3>
        <p className="text-gray-600 mt-2">
          Are you sure you want to delete{" "}
          <span className="font-semibold">{itemName}</span>? This cannot be
          undone.
        </p>
        <div className="flex justify-end space-x-4 mt-6">
          <button
          	onClick={onClose}
          	className="px-4 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        	>
          	Cancel
        	</button>
        	<button
          	onClick={onConfirm}
          	className="px-4 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg"
        	>
          	Delete
        	</button>
      	</div>
      </div>
    </div>
  );
};

// --- Batch Invoice Viewer Modal ---
const BatchInvoiceViewerModal = ({
  isOpen,
  onClose,
  onConfirm,
  onDownloadIndividual,
  orders = [],
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
  	if (isOpen) {
    	setCurrentIndex(0);
  	}
  }, [isOpen]);

  const handleNext = () => {
  	setCurrentIndex((prev) => (prev + 1) % orders.length);
  };

  const handlePrev = () => {
  	setCurrentIndex((prev) => (prev - 1 + orders.length) % orders.length);
  };

  if (!isOpen || orders.length === 0) return null;

  const order = orders[currentIndex];
  if (!order) return null;

  const totalAmount = order.items.reduce(
  	(sum, item) => sum + item.price * item.quantity,
  	0
  );

  return (
  	<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    	<div className="bg-white rounded-xl max-w-2xl w-full flex flex-col max-h-[90vh]">
      	{/* Header */}
      	<div className="flex justify-between items-center p-4 border-b bg-gray-50 rounded-t-xl">
        	<h3 className="text-lg font-semibold text-gray-800">
          	Batch Invoice Preview
        	</h3>
        	<button
          	onClick={onClose}
          	className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200"
          	title="Close"
        	>
          	<X className="w-5 h-5" />
        	</button>
      	</div>

      	{/* Invoice Content */}
      	<div id="invoice-content" className="p-6 overflow-y-auto flex-1">
        	{/* ... (Invoice details like header, bill to, items table, totals) ... */}
        	{/* Top Section */}
        	<div className="flex justify-between items-start mb-6">
          	<div>
            	<h1 className="text-2xl font-bold text-gray-900">FoodAdmin</h1>
            	<p className="text-sm text-gray-500">Kochi, Kerala</p>
          	</div>
          	<div className="text-right">
            	<h2 className="text-lg font-bold text-gray-700">
              	{order.isMergedInvoice
                	? "Daily Summary"
                	: `Order #${order.id.slice(-6).toUpperCase()}`}
            	</h2>
            	<p className="text-sm text-gray-500">
              	Date: {order.createdAtFormatted}
            	</p>
          	</div>
        	</div>

        	{/* Bill To */}
        	<div className="mb-8">
          	<h3 className="font-bold text-gray-800 mb-1">Bill To:</h3>
          	<p className="text-gray-600">{order.customerName}</p>
          	<p className="text-gray-600">{order.address}</p>
        	</div>

        	{/* Items Table */}
        	<table className="w-full mb-6">
          	<thead>
            	<tr className="border-b border-t border-gray-300">
              	<th className="text-left p-2 text-sm font-bold text-gray-700">Item</th>
          	  <th className="text-center p-2 text-sm font-bold text-gray-700">Qty</th>
              	<th className="text-right p-2 text-sm font-bold text-gray-700">Price</th>
              	<th className="text-right p-2 text-sm font-bold text-gray-700">Total</th>
            	</tr>
          	</thead>
          	<tbody>
            	{order.items.map((item, index) => (
              	<tr key={index}>
                	<td className="p-2">{item.name}</td>
                	<td className="p-2 text-center">{item.quantity}</td>
                	<td className="p-2 text-right">₹{item.price.toFixed(2)}</td>
  	            	<td className="p-2 text-right">
                  	₹{(item.price * item.quantity).toFixed(2)}
                	</td>
              	</tr>
            	))}
            	<tr className="border-t border-gray-300">
              	<td colSpan="4"></td>
            	</tr>
          	</tbody>
        	</table>

        	{/* Totals */}
        	<div className="text-right space-y-1">
          	<p className="text-gray-600">Subtotal: ₹{totalAmount.toFixed(2)}</p>
          	<p className="text-xl font-bold text-gray-900 mt-1">Total: ₹{totalAmount.toFixed(2)}</p>
        	</div>
      	</div>

      	{/* Footer with Navigation and Batch Download */}
      	<div className="flex justify-between items-center p-4 border-t bg-gray-50 rounded-b-xl">
        	{/* Left side: Navigation */}
        	<div className="flex items-center space-x-2">
          	<button
            	onClick={handlePrev}
            	disabled={orders.length <= 1}
            	className="px-4 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          	>
            	Previous
          	</button>
          	<span className="px-3 text-sm font-medium text-gray-600">
            	{currentIndex + 1} / {orders.length}
          	</span>
          	<button
            	onClick={handleNext}
            	disabled={orders.length <= 1}
            	className="px-4 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          	>
            	Next
          	</button>
        	</div>

        	{/* Right side: Actions */}
        	<div className="flex items-center space-x-3">
          	<button
            	onClick={onClose}
            	className="px-4 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
          	>
            	Cancel
          	</button>

          	{/* --- MODIFIED --- Added border and text color --- */}
          	<button
            	onClick={() => onDownloadIndividual(order)}
            	className="px-4 py-1.5 text-sm bg-white border border-red-500 text-red-600 hover:bg-red-50 rounded-lg flex items-center space-x-2"
            	title="Download just this one summary"
          	>
            	<Download className="w-4 h-4" />
            	<span>Download Current</span>
          	</button>
          	{/* --- END MODIFICATION --- */}

          	<button
            	onClick={onConfirm}
            	className="px-4 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center space-x-2"
          	>
            	<Download className="w-4 h-4" />
            	<span>Download All ({orders.length})</span>
          	</button>
        	</div>
      	</div>
      </div>
    </div>
  );
};


// --- Form Field Components ---
const InputField = ({ label, error, ...props }) => (
  <div>
    <label className="block text-sm font-medium mb-2">{label}</label>
    <input
      {...props}
      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-red-500 ${
        error ? "border-red-500" : "border-gray-300"
      }`}
    />
  	{error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

const TextareaField = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium mb-2">{label}</label>
  	<textarea
      {...props}
      rows="3"
      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-red-500 border-gray-300"
  	/>
  </div>
);

const SelectField = ({ label, options, error, ...props }) => (
  <div>
  	<label className="block text-sm font-medium mb-2">{label}</label>
  	<select
    	{...props}
    	className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-red-500 ${
      	error ? "border-red-500" : "border-gray-300"
    	}`}
  	>
    	<option value="">Select...</option>
    	{options.map((opt) => (
      	<option key={opt.value} value={opt.value}>
        	{opt.label}
      	</option>
    	))}
  	</select>
  	{error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

export default AdminDashboard;