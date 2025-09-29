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
  Bell,
  Menu,
  X,
  Save,
  Star,
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

  // Data states
  const [restaurantsData, setRestaurantsData] = useState([]);
  const [productsData, setProductsData] = useState([]);
  const [ordersData, setOrdersData] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);

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
        const formattedData = response.data.map((order) => {
          const totalPrice =
            order.cartIds?.reduce(
              (sum, item) => sum + item.price * item.quantity,
              0
            ) || 0;

          const restaurantName =
            order.cartIds?.[0]?.foodId?.restaurantId?.restaurantsName || "N/A";
          return {
            ...order,
            id: order._id,
            customerName: order.userId?.email || "Guest",
            restaurantName,
            amount: `₹${totalPrice.toFixed(2)}`,
            status: order.status || "Delivered",
          };
        });
        setOrdersData(formattedData);
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
            createdAt: new Date(user.createdAt).toLocaleDateString(),
          }))
        );
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };
    fetchUsers();
  }, [userDataVersion]);

  const handleEdit = (item, type) => {
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
      // ✅ Updated columns and dataKeys for restaurants
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
            columns={["Order ID", "Customer", "Amount", "Status"]}
            dataKeys={["id", "customerName", "amount", "status"]}
            statusKey="status"
            getStatusBadge={getStatusBadge}
            onEdit={(item) => handleEdit(item, "order")}
            onDelete={(item) => handleDelete(item, "order")}
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
    </div>
  );
};

// --- Sub-components ---
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
      {" "}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden transition-opacity ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      ></div>{" "}
      <div
        className={`fixed top-0 left-0 h-full bg-white shadow-xl z-40 w-64 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {" "}
        <div className="p-6 flex items-center space-x-3">
          {" "}
          <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
            <UtensilsCrossed className="w-6 h-6 text-white" />
          </div>{" "}
          <h1 className="text-xl font-bold text-gray-900">FoodAdmin</h1>{" "}
        </div>{" "}
        <nav className="mt-8">
          {" "}
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
          ))}{" "}
        </nav>{" "}
        <div className="absolute bottom-0 w-full p-6">
          {" "}
          <button
            onClick={() => {
              localStorage.removeItem("adminToken");
              navigate("/admin/login");
            }}
            className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="ml-3">Logout</span>
          </button>{" "}
        </div>{" "}
      </div>{" "}
    </>
  );
};
const Header = ({ activeTab, setSidebarOpen }) => (
  <header className="bg-white border-b px-4 sm:px-6 py-4">
    {" "}
    <div className="flex items-center justify-between">
      {" "}
      <div className="flex items-center space-x-4">
        {" "}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
        >
          <Menu className="w-5 h-5" />
        </button>{" "}
        <h1 className="text-xl sm:text-2xl font-semibold capitalize">
          {activeTab}
        </h1>{" "}
      </div>{" "}
      <div className="flex items-center space-x-4">
        {" "}
        <button className="p-2 hover:bg-gray-100 rounded-lg relative"></button>{" "}
        <div className="flex items-center space-x-3">
          {" "}
          <div className="hidden md:block">
            <p className="text-sm font-medium">Admin User</p>
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>{" "}
  </header>
);
const DashboardView = ({ stats, recentOrders, getStatusBadge }) => (
  <div className="space-y-6">
    {" "}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {" "}
      {stats.map((stat, i) => (
        <div key={i} className="bg-white p-6 rounded-xl shadow-sm border">
          <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
          <p className="text-2xl font-bold mt-1">{stat.value}</p>
        </div>
      ))}{" "}
    </div>{" "}
    <div className="bg-white rounded-xl shadow-sm border">
      {" "}
      <h2 className="text-lg font-semibold p-6 border-b">Recent Orders</h2>{" "}
      <div className="overflow-x-auto">
        <table className="w-full">
          {" "}
          <thead className="bg-gray-50">
            {" "}
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
            </tr>{" "}
          </thead>{" "}
          <tbody>
            {" "}
            {recentOrders.map((order) => (
              <tr key={order.id} className="border-b hover:bg-gray-50">
                {" "}
                <td className="py-3 px-6 text-sm font-medium truncate max-w-xs">
                  {order.id}
                </td>{" "}
                <td className="py-3 px-6 text-sm truncate max-w-xs">
                  {order.customerName}
                </td>{" "}
                <td className="py-3 px-6 text-sm">{order.restaurantName}</td>{" "}
                <td className="py-3 px-6 text-sm font-semibold">
                  {order.amount}
                </td>{" "}
                <td className="py-3 px-6">
                  <span className={getStatusBadge(order.status)}>
                    {order.status}
                  </span>
                </td>{" "}
              </tr>
            ))}{" "}
          </tbody>{" "}
        </table>
      </div>{" "}
    </div>{" "}
  </div>
);
const TableView = ({
  title,
  data,
  columns,
  dataKeys,
  onAdd,
  onEdit,
  onDelete,
  getStatusBadge,
  statusKey,
}) => (
  <div className="space-y-6">
    {" "}
    <div className="flex justify-between items-center">
      {" "}
      {onAdd && (
        <button
          onClick={onAdd}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add {title.slice(0, -1)}</span>
        </button>
      )}{" "}
    </div>{" "}
    <div className="bg-white rounded-xl shadow-sm border">
      {" "}
      <div className="overflow-x-auto">
        {" "}
        <table className="w-full">
          {" "}
          <thead className="bg-gray-50">
            {" "}
            <tr>
              {" "}
              {columns.map((c) => (
                <th
                  key={c}
                  className="text-left py-3 px-6 text-sm font-medium text-gray-700"
                >
                  {c}
                </th>
              ))}{" "}
              <th className="text-left py-3 px-6 text-sm font-medium text-gray-700">
                Actions
              </th>{" "}
            </tr>{" "}
          </thead>{" "}
          <tbody>
            {" "}
            {data.map((item) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                {" "}
                {dataKeys.map((key) => (
                  <td
                    key={`${item.id}-${key}`}
                    className="py-3 px-6 text-sm text-gray-700 truncate max-w-xs"
                  >
                    {" "}
                    {key === statusKey ? (
                      <span
                        className={getStatusBadge(item[key])}
                      >{`${item[key]}`}</span>
                    ) : Array.isArray(item[key]) ? (
                      item[key].join(", ")
                    ) : (
                      item[key]
                    )}{" "}
                  </td>
                ))}{" "}
                <td className="py-3 px-6">
                  {" "}
                  <div className="flex items-center space-x-2">
                    {" "}
                    {onEdit && (
                      <button
                        onClick={() => onEdit(item)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Edit className="w-4 h-4 text-gray-500" />
                      </button>
                    )}{" "}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(item)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    )}{" "}
                  </div>{" "}
                </td>{" "}
              </tr>
            ))}{" "}
          </tbody>{" "}
        </table>{" "}
      </div>{" "}
    </div>{" "}
  </div>
);
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
      {" "}
      <form onSubmit={formik.handleSubmit} className="space-y-6">
        {" "}
        <div>
          {" "}
          <label className="block text-sm font-medium mb-2">
            Customer
          </label>{" "}
          <input
            type="text"
            value={order?.customerName || ""}
            disabled
            className="w-full px-4 py-2 border rounded-lg bg-gray-100"
          />{" "}
        </div>{" "}
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
        />{" "}
        <div className="flex justify-end space-x-4 pt-6">
          {" "}
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>{" "}
          <button
            type="submit"
            className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Update Order</span>
          </button>{" "}
        </div>{" "}
      </form>{" "}
    </FormModal>
  );
};
const FormModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      {" "}
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {" "}
        <div className="flex justify-between items-center p-6 border-b">
          {" "}
          <h2 className="text-xl font-bold">{title}</h2>{" "}
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>{" "}
        </div>{" "}
        <div className="p-6">{children}</div>{" "}
      </div>{" "}
    </div>
  );
};
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
      {" "}
      <form onSubmit={formik.handleSubmit} className="space-y-6">
        {" "}
        <div className="grid md:grid-cols-2 gap-6">
          {" "}
          <InputField
            label="Product Name"
            name="name"
            {...formik.getFieldProps("name")}
            error={formik.touched.name && formik.errors.name}
          />{" "}
          <InputField
            label="Price"
            name="price"
            type="number"
            {...formik.getFieldProps("price")}
            error={formik.touched.price && formik.errors.price}
          />{" "}
        </div>{" "}
        <TextareaField
          label="Description"
          name="description"
          {...formik.getFieldProps("description")}
        />{" "}
        <div>
          {" "}
          <label className="block text-sm font-medium mb-2">Image</label>{" "}
          <div className="flex items-center gap-4">
            {" "}
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="w-20 h-20 rounded-md object-cover"
              />
            )}{" "}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
            />{" "}
          </div>{" "}
        </div>{" "}
        <div className="grid md:grid-cols-3 gap-6">
          {" "}
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
          />{" "}
          <SelectField
            label="Restaurant"
            name="restaurantId"
            {...formik.getFieldProps("restaurantId")}
            options={restaurants.map((r) => ({
              label: r.restaurantsName,
              value: r.id,
            }))}
            error={formik.touched.restaurantId && formik.errors.restaurantId}
          />{" "}
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
          />{" "}
        </div>{" "}
        <div className="flex justify-end space-x-4 pt-6">
          {" "}
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>{" "}
          <button
            type="submit"
            className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>{" "}
        </div>{" "}
      </form>{" "}
    </FormModal>
  );
};

// ✅ Updated RestaurantModal
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
            className="px-6 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>
        </div>
      </form>
    </FormModal>
  );
};

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, itemName }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      {" "}
      <div className="bg-white rounded-xl p-8 max-w-sm w-full">
        {" "}
        <h3 className="text-lg font-bold">Confirm Deletion</h3>{" "}
        <p className="text-gray-600 mt-2">
          Are you sure you want to delete{" "}
          <span className="font-semibold">{itemName}</span>? This cannot be
          undone.
        </p>{" "}
        <div className="flex justify-end space-x-4 mt-6">
          {" "}
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>{" "}
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
          >
            Delete
          </button>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};
const InputField = ({ label, error, ...props }) => (
  <div>
    {" "}
    <label className="block text-sm font-medium mb-2">{label}</label>{" "}
    <input
      {...props}
      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-red-500 ${
        error ? "border-red-500" : "border-gray-300"
      }`}
    />{" "}
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}{" "}
  </div>
);
const TextareaField = ({ label, ...props }) => (
  <div>
    {" "}
    <label className="block text-sm font-medium mb-2">{label}</label>{" "}
    <textarea
      {...props}
      rows="3"
      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-red-500 border-gray-300"
    />{" "}
  </div>
);
const SelectField = ({ label, options, error, ...props }) => (
  <div>
    {" "}
    <label className="block text-sm font-medium mb-2">{label}</label>{" "}
    <select
      {...props}
      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-red-500 ${
        error ? "border-red-500" : "border-gray-300"
      }`}
    >
      {" "}
      <option value="">Select...</option>{" "}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}{" "}
    </select>{" "}
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}{" "}
  </div>
);

export default AdminDashboard;
