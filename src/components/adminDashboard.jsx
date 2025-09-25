import React, { useState, useEffect } from "react";
import {
  LayoutDashboard, Store, UtensilsCrossed, Users, ShoppingBag, BarChart3, Settings, LogOut, Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Eye, ChevronDown, Bell, Menu, X, Upload, Save, Star,
} from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
// All necessary API functions are imported
import { 
  addRestaurants, updateRestaurant, deleteRestaurant, getAllRestaurants, 
  addFoodItem, getAllFoodItems, updateFoodItem, deleteFoodItem 
} from "../services/adminAPI";

// --- Main Admin Dashboard Component ---
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modal states
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddRestaurantModal, setShowAddRestaurantModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [showEditRestaurantModal, setShowEditRestaurantModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Data states
  const [restaurantsData, setRestaurantsData] = useState([]);
  const [productsData, setProductsData] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);
  
  // State to trigger data re-fetches
  const [restaurantDataVersion, setRestaurantDataVersion] = useState(0);
  const [productDataVersion, setProductDataVersion] = useState(0);

  // Effect for fetching Restaurants
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await getAllRestaurants();
        const fetchedData = response.data || response || [];
        const formattedData = fetchedData.map(item => ({ ...item, id: item._id })).filter(item => item.id);
        setRestaurantsData(formattedData);
      } catch (error) {
        console.error("Failed to fetch restaurants:", error);
        setRestaurantsData([]);
      }
    };
    fetchRestaurants();
  }, [restaurantDataVersion]);

  // Effect for fetching Products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getAllFoodItems();
        const fetchedData = response.data || response || [];
        const formattedData = fetchedData.map(item => ({
          ...item,
          id: item._id,
          restaurant: item.restaurantId ? item.restaurantId.restaurantsName : 'N/A',
          restaurantId: item.restaurantId ? item.restaurantId._id : null
        })).filter(item => item.id);
        setProductsData(formattedData);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setProductsData([]);
      }
    };
    fetchProducts();
  }, [productDataVersion]);

  const handleEdit = (item, type) => {
    setCurrentItem(item);
    if (type === 'product') setShowEditProductModal(true);
    if (type === 'restaurant') setShowEditRestaurantModal(true);
  };

  const handleDelete = (item, type) => {
    setCurrentItem({ ...item, type });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!currentItem || !currentItem.id) {
      console.error("Cannot delete: item or item ID is missing.");
      setShowDeleteModal(false);
      setCurrentItem(null);
      return;
    }
    try {
      if (currentItem.type === 'product') {
        await deleteFoodItem(currentItem.id);
        setProductDataVersion(v => v + 1);
      }
      if (currentItem.type === 'restaurant') {
        await deleteRestaurant(currentItem.id);
        setRestaurantDataVersion(v => v + 1);
      }
    } catch (error) {
      console.error("Failed to delete item:", error);
    } finally {
      setShowDeleteModal(false);
      setCurrentItem(null);
    }
  };

  const handleAddOrUpdate = async (item, type) => {
    try {
      if (type === 'product') {
        if (item.id) {
          await updateFoodItem(item.id, item);
        } else {
          await addFoodItem(item);
        }
        setProductDataVersion(v => v + 1);
      }
      if (type === 'restaurant') {
        if (item.id) {
          await updateRestaurant(item.id, item);
        } else {
          await addRestaurants(item);
        }
        setRestaurantDataVersion(v => v + 1);
      }
    } catch (error) {
      console.error(`Failed to add or update ${type}:`, error);
    }
    
    setShowAddProductModal(false);
    setShowEditProductModal(false);
    setShowAddRestaurantModal(false);
    setShowEditRestaurantModal(false);
    setCurrentItem(null);
  };
  
  const sidebarItems = [ { id: "dashboard", label: "Dashboard", icon: LayoutDashboard }, { id: "restaurants", label: "Restaurants", icon: Store }, { id: "products", label: "Products", icon: UtensilsCrossed }, { id: "orders", label: "Orders", icon: ShoppingBag }, { id: "users", label: "Users", icon: Users }, ];
  const stats = [ { title: "Total Orders", value: "1,234" }, { title: "Restaurants", value: restaurantsData.length }, { title: "Products", value: productsData.length }, { title: "Revenue", value: "₹89,432" }, ];
  const recentOrders = [ { id: "#ORD-001", customer: "John Doe", restaurant: "Mario's Pizzeria", amount: "₹450", status: "Delivered" }, { id: "#ORD-002", customer: "Jane Smith", restaurant: "Burger Junction", amount: "₹320", status: "Preparing" }, ];
  const getStatusBadge = (status) => { const statusColors = { "Delivered": "bg-green-100 text-green-800", "Preparing": "bg-yellow-100 text-yellow-800", "Active": "bg-green-100 text-green-800", true: "bg-green-100 text-green-800", "Inactive": "bg-red-100 text-red-800", false: "bg-red-100 text-red-800", "Available": "bg-green-100 text-green-800", "Out of Stock": "bg-red-100 text-red-800", }; return `px-3 py-1 rounded-full text-sm font-medium ${statusColors[status] || "bg-gray-100 text-gray-800"}`; };
  
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return <DashboardView stats={stats} recentOrders={recentOrders} getStatusBadge={getStatusBadge} />;
      case "restaurants": return <TableView title="Restaurants" data={restaurantsData} columns={['Restaurant', 'Cuisine', 'Rating', 'Status']} onAdd={() => setShowAddRestaurantModal(true)} onEdit={(item) => handleEdit(item, 'restaurant')} onDelete={(item) => handleDelete(item, 'restaurant')} getStatusBadge={getStatusBadge} dataKeys={['restaurantsName', 'cuisine', 'rating', 'isActive']} />;
      case "products": return <TableView title="Products" data={productsData} columns={['Product', 'Restaurant', 'Category', 'Price', 'Status']} onAdd={() => setShowAddProductModal(true)} onEdit={(item) => handleEdit(item, 'product')} onDelete={(item) => handleDelete(item, 'product')} getStatusBadge={getStatusBadge} dataKeys={['name', 'restaurant', 'category', 'price', 'isAvailable']} />;
      default: return <div className="text-center p-10 text-gray-500">Content for {activeTab} coming soon...</div>;
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar sidebarItems={sidebarItems} activeTab={activeTab} setActiveTab={setActiveTab} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="lg:ml-64">
        {/* Header */}
        <Header activeTab={activeTab} setSidebarOpen={setSidebarOpen} />
        
        {/* Main Content */}
        <main className="p-4 sm:p-6">{renderContent()}</main>
      </div>

      {/* Modals */}
      <ProductModal isOpen={showAddProductModal || showEditProductModal} onClose={() => { setShowAddProductModal(false); setShowEditProductModal(false); setCurrentItem(null); }} product={currentItem} onSave={(product) => handleAddOrUpdate(product, 'product')} restaurants={restaurantsData} />
      <RestaurantModal isOpen={showAddRestaurantModal || showEditRestaurantModal} onClose={() => { setShowAddRestaurantModal(false); setShowEditRestaurantModal(false); setCurrentItem(null); }} restaurant={currentItem} onSave={(restaurant) => handleAddOrUpdate(restaurant, 'restaurant')} />
      <DeleteConfirmationModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} onConfirm={confirmDelete} itemName={currentItem?.restaurantsName || currentItem?.name} />
    </div>
  );
};

// --- Sub-components ---
const Sidebar = ({ sidebarItems, activeTab, setActiveTab, sidebarOpen, setSidebarOpen }) => (
  <>
    {/* Backdrop for mobile */}
    <div className={`fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setSidebarOpen(false)}></div>

    <div className={`fixed top-0 left-0 h-full bg-white shadow-xl z-40 w-64 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
            <UtensilsCrossed className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">FoodAdmin</h1>
        </div>
      </div>
      <nav className="mt-8">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }} className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-50 transition-colors ${activeTab === item.id ? 'bg-red-50 text-red-600 border-r-4 border-red-500' : 'text-gray-700'}`}>
              <Icon className="w-5 h-5" />
              <span className="ml-3">{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="absolute bottom-0 w-full p-6">
        <button className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
          <LogOut className="w-5 h-5" />
          <span className="ml-3">Logout</span>
        </button>
      </div>
    </div>
  </>
);
const Header = ({ activeTab, setSidebarOpen }) => ( <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4"> <div className="flex items-center justify-between"> <div className="flex items-center space-x-4"> <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"><Menu className="w-5 h-5" /></button> <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 capitalize">{activeTab}</h1> </div> <div className="flex items-center space-x-2 sm:space-x-4"> <button className="p-2 hover:bg-gray-100 rounded-lg relative"> <Bell className="w-5 h-5 text-gray-600" /> <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">3</span> </button> <div className="flex items-center space-x-3"> <div className="w-8 h-8 bg-gray-300 rounded-full"></div> <div className="hidden md:block"> <p className="text-sm font-medium text-gray-900">Admin User</p> </div> </div> </div> </div> </header> );
const DashboardView = ({ stats, recentOrders, getStatusBadge }) => ( <div className="space-y-6"> <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"> {stats.map((stat, index) => ( <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"> <p className="text-gray-600 text-sm font-medium">{stat.title}</p> <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p> </div> ))} </div> <div className="bg-white rounded-xl shadow-sm border border-gray-200"> <h2 className="text-lg font-semibold text-gray-900 p-4 sm:p-6 border-b">Recent Orders</h2> <div className="overflow-x-auto"><table className="w-full"><thead className="bg-gray-50"><tr>{['Order ID', 'Customer', 'Restaurant', 'Amount', 'Status'].map(h => <th key={h} className="text-left py-3 px-2 sm:px-6 text-sm font-medium text-gray-700">{h}</th>)}</tr></thead><tbody>{recentOrders.map((order) => (<tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50"><td className="py-3 px-2 sm:px-6 text-sm font-medium">{order.id}</td><td className="py-3 px-2 sm:px-6 text-sm">{order.customer}</td><td className="py-3 px-2 sm:px-6 text-sm">{order.restaurant}</td><td className="py-3 px-2 sm:px-6 text-sm font-semibold">{order.amount}</td><td className="py-3 px-2 sm:px-6"><span className={getStatusBadge(order.status)}>{order.status}</span></td></tr>))}</tbody></table></div> </div> </div> );
const TableView = ({ title, data, columns, onAdd, onEdit, onDelete, getStatusBadge, dataKeys }) => ( <div className="space-y-6"> <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center"> <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-0">{title}</h1> <button onClick={onAdd} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 w-full sm:w-auto"><Plus className="w-4 h-4" /><span>Add {title.slice(0, -1)}</span></button> </div> <div className="bg-white rounded-xl shadow-sm border border-gray-200"> <div className="overflow-x-auto"><table className="w-full"><thead className="bg-gray-50"><tr>{columns.concat('Actions').map(c => <th key={c} className="text-left py-3 px-2 sm:px-6 text-sm font-medium text-gray-700">{c}</th>)}</tr></thead><tbody>{data.map((item) => (<tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">{dataKeys.map((key) => { const val = item[key]; return ( <td key={`${item.id}-${key}`} className="py-3 px-2 sm:px-6 text-sm text-gray-700">{key === 'isAvailable' || key === 'isActive' ? <span className={getStatusBadge(val)}>{val ? 'Available' : 'Unavailable'}</span> : key === 'rating' ? <span className="flex items-center"><Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />{val}</span> : Array.isArray(val) ? val.join(', ') : val}</td> ); })}<td className="py-3 px-2 sm:px-6"><div className="flex items-center space-x-2"><button onClick={() => onEdit(item)} className="p-1 hover:bg-gray-100 rounded"><Edit className="w-4 h-4 text-gray-500" /></button><button onClick={() => onDelete(item)} className="p-1 hover:bg-gray-100 rounded"><Trash2 className="w-4 h-4 text-red-500" /></button></div></td></tr>))}</tbody></table></div> </div> </div> );
const FormModal = ({ isOpen, onClose, title, children }) => { if (!isOpen) return null; return ( <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"> <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"> <div className="flex justify-between items-center p-4 sm:p-6 border-b"><h2 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h2><button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button></div> <div className="p-4 sm:p-6">{children}</div> </div> </div> ); };
const ProductModal = ({ isOpen, onClose, product, onSave, restaurants = [] }) => { const validationSchema = Yup.object({ name: Yup.string().required("Product name is required"), description: Yup.string(), price: Yup.number().positive("Price must be positive").required("Price is required"), image: Yup.string().url("Must be a valid URL"), category: Yup.string().required("Category is required"), restaurantId: Yup.string().required("Please select a restaurant"), isAvailable: Yup.boolean(), }); const formik = useFormik({ initialValues: { name: product?.name || '', description: product?.description || '', price: product?.price || '', image: product?.image || '', category: product?.category || '', restaurantId: product?.restaurantId || '', isAvailable: product?.isAvailable ?? true, }, validationSchema: validationSchema, enableReinitialize: true, onSubmit: (values) => { const restaurantName = restaurants.find(r => r.id === values.restaurantId)?.restaurantsName || ''; onSave({ ...product, ...values, restaurant: restaurantName }); }, }); return ( <FormModal isOpen={isOpen} onClose={onClose} title={product ? "Edit Product" : "Add New Product"}> <form onSubmit={formik.handleSubmit} className="space-y-4 sm:space-y-6"> <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"> <InputField label="Product Name" name="name" {...formik.getFieldProps('name')} error={formik.touched.name && formik.errors.name} helperText={formik.errors.name} /> <InputField label="Price" name="price" type="number" {...formik.getFieldProps('price')} error={formik.touched.price && formik.errors.price} helperText={formik.errors.price} /> </div> <TextareaField label="Description" name="description" {...formik.getFieldProps('description')} error={formik.touched.description && formik.errors.description} helperText={formik.errors.description} /> <InputField label="Image URL" name="image" {...formik.getFieldProps('image')} error={formik.touched.image && formik.errors.image} helperText={formik.errors.image} /> <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6"> <SelectField label="Category" name="category" {...formik.getFieldProps('category')} options={["Biriyani", "Drinks", "Dessert", "Main Course", "Appetizers", "Salads", "Soups", "Snacks"].map(c => ({ label: c, value: c }))} error={formik.touched.category && formik.errors.category} helperText={formik.errors.category} /> <SelectField label="Restaurant" name="restaurantId" {...formik.getFieldProps('restaurantId')} options={(Array.isArray(restaurants) ? restaurants : []).map(r => ({ label: r.restaurantsName, value: r.id }))} error={formik.touched.restaurantId && formik.errors.restaurantId} helperText={formik.errors.restaurantId} /> <SelectField label="Status" name="isAvailable" value={formik.values.isAvailable} onChange={(e) => formik.setFieldValue('isAvailable', e.target.value === 'true')} options={[{ label: 'Available', value: true }, { label: 'Unavailable', value: false }]} error={formik.touched.isAvailable && formik.errors.isAvailable} helperText={formik.errors.isAvailable} /> </div> <div className="flex justify-end space-x-4 pt-4 sm:pt-6"> <button type="button" onClick={onClose} className="px-6 py-2 border rounded-lg hover:bg-gray-50">Cancel</button> <button type="submit" className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center space-x-2"> <Save className="w-4 h-4" /><span>Save Product</span> </button> </div> </form> </FormModal> ); };
const RestaurantModal = ({ isOpen, onClose, restaurant, onSave }) => { const validationSchema = Yup.object({ restaurantsName: Yup.string().required("Restaurant name is required"), description: Yup.string(), cuisine: Yup.string().required("Cuisine type(s) are required. Use commas to separate."), rating: Yup.number().min(0, "Rating must be positive").max(5, "Rating cannot exceed 5").required("Rating is required"), isActive: Yup.boolean(), address: Yup.object({ street: Yup.string().required("Street is required"), city: Yup.string().required("City is required"), state: Yup.string().required("State is required"), pincode: Yup.string().matches(/^[1-9][0-9]{5}$/, "Invalid Indian pincode").required("Pincode is required"), }), contact: Yup.object({ phone: Yup.string().matches(/^[0-9]{10}$/, "Phone number must be 10 digits").required("Phone number is required"), email: Yup.string().email("Invalid email address").required("Email is required"), }), openingHours: Yup.object({ open: Yup.string().required("Opening time is required"), close: Yup.string().required("Closing time is required"), }), }); const formik = useFormik({ initialValues: { restaurantsName: restaurant?.restaurantsName || '', description: restaurant?.description || '', cuisine: Array.isArray(restaurant?.cuisine) ? restaurant.cuisine.join(', ') : '', rating: restaurant?.rating || 0, isActive: restaurant?.isActive ?? true, address: { street: restaurant?.address?.street || '', city: restaurant?.address?.city || '', state: restaurant?.address?.state || '', pincode: restaurant?.address?.pincode || '', }, contact: { phone: restaurant?.contact?.phone || '', email: restaurant?.contact?.email || '', }, openingHours: { open: restaurant?.openingHours?.open || '09:00', close: restaurant?.openingHours?.close || '22:00', }, }, validationSchema: validationSchema, enableReinitialize: true, onSubmit: (values) => { const submissionData = { ...restaurant, ...values, cuisine: values.cuisine.split(',').map(c => c.trim()).filter(Boolean), }; onSave(submissionData); }, }); return ( <FormModal isOpen={isOpen} onClose={onClose} title={restaurant ? "Edit Restaurant" : "Add New Restaurant"}> <form onSubmit={formik.handleSubmit} className="space-y-4 sm:space-y-6"> <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Basic Information</h3> <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"> <InputField label="Restaurant Name" name="restaurantsName" {...formik.getFieldProps('restaurantsName')} error={formik.touched.restaurantsName && formik.errors.restaurantsName} helperText={formik.errors.restaurantsName} /> <InputField label="Cuisine (comma-separated)" name="cuisine" {...formik.getFieldProps('cuisine')} error={formik.touched.cuisine && formik.errors.cuisine} helperText={formik.errors.cuisine} /> </div> <TextareaField label="Description" name="description" {...formik.getFieldProps('description')} error={formik.touched.description && formik.errors.description} helperText={formik.errors.description} /> <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mt-4">Address</h3> <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"> <InputField label="Street" name="address.street" {...formik.getFieldProps('address.street')} error={formik.touched.address?.street && formik.errors.address?.street} helperText={formik.errors.address?.street} /> <InputField label="City" name="address.city" {...formik.getFieldProps('address.city')} error={formik.touched.address?.city && formik.errors.address?.city} helperText={formik.errors.address?.city} /> <InputField label="State" name="address.state" {...formik.getFieldProps('address.state')} error={formik.touched.address?.state && formik.errors.address?.state} helperText={formik.errors.address?.state} /> <InputField label="Pincode" name="address.pincode" {...formik.getFieldProps('address.pincode')} error={formik.touched.address?.pincode && formik.errors.address?.pincode} helperText={formik.errors.address?.pincode} /> </div> <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mt-4">Contact & Hours</h3> <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"> <InputField label="Phone Number" name="contact.phone" {...formik.getFieldProps('contact.phone')} error={formik.touched.contact?.phone && formik.errors.contact?.phone} helperText={formik.errors.contact?.phone} /> <InputField label="Email Address" name="contact.email" type="email" {...formik.getFieldProps('contact.email')} error={formik.touched.contact?.email && formik.errors.contact?.email} helperText={formik.errors.contact?.email} /> <InputField label="Opening Time" name="openingHours.open" type="time" {...formik.getFieldProps('openingHours.open')} error={formik.touched.openingHours?.open && formik.errors.openingHours?.open} helperText={formik.errors.openingHours?.open} /> <InputField label="Closing Time" name="openingHours.close" type="time" {...formik.getFieldProps('openingHours.close')} error={formik.touched.openingHours?.close && formik.errors.openingHours?.close} helperText={formik.errors.openingHours?.close} /> </div> <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mt-4">Other Details</h3> <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"> <InputField label="Rating (0-5)" name="rating" type="number" step="0.1" {...formik.getFieldProps('rating')} error={formik.touched.rating && formik.errors.rating} helperText={formik.errors.rating} /> <SelectField label="Status" name="isActive" value={formik.values.isActive} onChange={(e) => formik.setFieldValue('isActive', e.target.value === 'true')} options={[{label: 'Active', value: true}, {label: 'Inactive', value: false}]} error={formik.touched.isActive && formik.errors.isActive} helperText={formik.errors.isActive} /> </div> <div className="flex justify-end space-x-4 pt-4 sm:pt-6"> <button type="button" onClick={onClose} className="px-6 py-2 border rounded-lg hover:bg-gray-50">Cancel</button> <button type="submit" className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center space-x-2"> <Save className="w-4 h-4" /><span>Save Restaurant</span> </button> </div> </form> </FormModal> ); };
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, itemName }) => { if (!isOpen) return null; return ( <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"> <div className="bg-white rounded-xl p-8 max-w-sm w-full"> <h3 className="text-lg font-bold text-gray-900">Confirm Deletion</h3> <p className="text-gray-600 mt-2">Are you sure you want to delete <span className="font-semibold">{itemName}</span>? This action cannot be undone.</p> <div className="flex justify-end space-x-4 mt-6"> <button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button> <button onClick={onConfirm} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg">Delete</button> </div> </div> </div> ); };
const InputField = ({ label, error, helperText, ...props }) => ( <div> <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label> <input {...props} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-red-500 ${ error ? 'border-red-500 ring-red-200' : 'border-gray-300 focus:ring-red-200' }`} /> {error && <p className="mt-1 text-xs text-red-600">{helperText}</p>} </div> );
const TextareaField = ({ label, error, helperText, ...props }) => ( <div> <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label> <textarea {...props} rows="3" className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-red-500 ${ error ? 'border-red-500 ring-red-200' : 'border-gray-300 focus:ring-red-200' }`} /> {error && <p className="mt-1 text-xs text-red-600">{helperText}</p>} </div> );
const SelectField = ({ label, options, error, helperText, ...props }) => ( <div> <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label> <select {...props} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-red-500 ${ error ? 'border-red-500 ring-red-200' : 'border-gray-300 focus:ring-red-200' }`}> <option value="">Select {label.toLowerCase()}</option> {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)} </select> {error && <p className="mt-1 text-xs text-red-600">{helperText}</p>} </div> );

export default AdminDashboard;