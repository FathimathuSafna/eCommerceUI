import React, { useState, useEffect } from "react";
import {
  LayoutDashboard, Store, UtensilsCrossed, Users, ShoppingBag, LogOut, Plus, Edit, Trash2, Bell, Menu, X, Save, Star,
} from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { 
  addRestaurants, updateRestaurant, deleteRestaurant, getAllRestaurants, 
  addFoodItem, getAllFoodItems, updateFoodItem, deleteFoodItem 
} from "../../services/adminAPI";
import {getAllOrders,deleteOrder} from "../../services/orderAPI";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../store/supabaseClient"; // Make sure supabase is configured


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

 const handleAddOrUpdate = async (itemData, type, imageFile = null) => {
    try {
      let submissionData = { ...itemData };

      if (imageFile) {
        const filePath = `${type}-images/${Date.now()}-${imageFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('images')
          .getPublicUrl(filePath);

        submissionData.image = urlData.publicUrl;
      }

      if (type === 'product') {
        if (submissionData.id) {
          await updateFoodItem(submissionData.id, submissionData);
        } else {
          await addFoodItem(submissionData);
        }
        setProductDataVersion(v => v + 1);
      } else if (type === 'restaurant') {
        if (submissionData.id) {
          await updateRestaurant(submissionData.id, submissionData);
        } else {
          await addRestaurants(submissionData);
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
      <Sidebar sidebarItems={sidebarItems} activeTab={activeTab} setActiveTab={setActiveTab} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="lg:ml-64">
        <Header activeTab={activeTab} setSidebarOpen={setSidebarOpen} />
        <main className="p-4 sm:p-6">{renderContent()}</main>
      </div>

      <ProductModal 
        isOpen={showAddProductModal || showEditProductModal} 
        onClose={() => { setShowAddProductModal(false); setShowEditProductModal(false); setCurrentItem(null); }} 
        product={currentItem} 
        onSave={(product, file) => handleAddOrUpdate(product, 'product', file)} 
        restaurants={restaurantsData} 
      />
      <RestaurantModal 
        isOpen={showAddRestaurantModal || showEditRestaurantModal} 
        onClose={() => { setShowAddRestaurantModal(false); setShowEditRestaurantModal(false); setCurrentItem(null); }} 
        restaurant={currentItem} 
        onSave={(restaurant, file) => handleAddOrUpdate(restaurant, 'restaurant', file)} 
      />
      <DeleteConfirmationModal 
        isOpen={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)} 
        onConfirm={confirmDelete} 
        itemName={currentItem?.restaurantsName || currentItem?.name} 
      />
    </div>
  );
};

// --- Sub-components ---
const Sidebar = ({ sidebarItems, activeTab, setActiveTab, sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  
  return (
    <>
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={() => setSidebarOpen(false)}
      ></div>
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
          <button
            className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            onClick={() => {
              localStorage.removeItem("adminToken");
              navigate("/admin/login");
            }}
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
  <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4"> 
    <div className="flex items-center justify-between"> 
      <div className="flex items-center space-x-4"> 
        <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"><Menu className="w-5 h-5" /></button> 
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 capitalize">{activeTab}</h1> 
      </div> 
      <div className="flex items-center space-x-2 sm:space-x-4"> 
        <button className="p-2 hover:bg-gray-100 rounded-lg relative"> 
          <Bell className="w-5 h-5 text-gray-600" /> 
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">3</span> 
        </button> 
        <div className="flex items-center space-x-3"> 
          <div className="w-8 h-8 bg-gray-300 rounded-full"></div> 
          <div className="hidden md:block"> 
            <p className="text-sm font-medium text-gray-900">Admin User</p> 
          </div> 
        </div> 
      </div> 
    </div> 
  </header> 
);

const DashboardView = ({ stats, recentOrders, getStatusBadge }) => ( 
  <div className="space-y-6"> 
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"> 
      {stats.map((stat, index) => ( 
        <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"> 
          <p className="text-gray-600 text-sm font-medium">{stat.title}</p> 
          <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p> 
        </div> 
      ))} 
    </div> 
    <div className="bg-white rounded-xl shadow-sm border border-gray-200"> 
      <h2 className="text-lg font-semibold text-gray-900 p-4 sm:p-6 border-b">Recent Orders</h2> 
      <div className="overflow-x-auto">
        <table className="w-full min-w-max">
          <thead className="bg-gray-50">
            <tr>{['Order ID', 'Customer', 'Restaurant', 'Amount', 'Status'].map(h => <th key={h} className="text-left py-3 px-2 sm:px-6 text-sm font-medium text-gray-700">{h}</th>)}</tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => (
              <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-2 sm:px-6 text-sm font-medium">{order.id}</td>
                <td className="py-3 px-2 sm:px-6 text-sm">{order.customer}</td>
                <td className="py-3 px-2 sm:px-6 text-sm">{order.restaurant}</td>
                <td className="py-3 px-2 sm:px-6 text-sm font-semibold">{order.amount}</td>
                <td className="py-3 px-2 sm:px-6"><span className={getStatusBadge(order.status)}>{order.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div> 
    </div> 
  </div> 
);

const TableView = ({ title, data, columns, onAdd, onEdit, onDelete, getStatusBadge, dataKeys }) => ( 
  <div className="space-y-6"> 
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center"> 
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-0">{title}</h1> 
      <button onClick={onAdd} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 w-full sm:w-auto"><Plus className="w-4 h-4" /><span>Add {title.slice(0, -1)}</span></button> 
    </div> 
    <div className="bg-white rounded-xl shadow-sm border border-gray-200"> 
      <div className="overflow-x-auto">
        <table className="w-full min-w-max">
          <thead className="bg-gray-50">
            <tr>{columns.concat('Actions').map(c => <th key={c} className="text-left py-3 px-2 sm:px-6 text-sm font-medium text-gray-700">{c}</th>)}</tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                {dataKeys.map((key) => { 
                  const val = item[key]; 
                  return ( <td key={`${item.id}-${key}`} className="py-3 px-2 sm:px-6 text-sm text-gray-700">{key === 'isAvailable' || key === 'isActive' ? <span className={getStatusBadge(val)}>{val ? 'Available' : 'Unavailable'}</span> : key === 'rating' ? <span className="flex items-center"><Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />{val}</span> : Array.isArray(val) ? val.join(', ') : val}</td> ); 
                })}
                <td className="py-3 px-2 sm:px-6">
                  <div className="flex items-center space-x-2">
                    <button onClick={() => onEdit(item)} className="p-1 hover:bg-gray-100 rounded"><Edit className="w-4 h-4 text-gray-500" /></button>
                    <button onClick={() => onDelete(item)} className="p-1 hover:bg-gray-100 rounded"><Trash2 className="w-4 h-4 text-red-500" /></button>
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

const FormModal = ({ isOpen, onClose, title, children }) => { 
  if (!isOpen) return null; 
  return ( 
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"> 
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"> 
        <div className="flex justify-between items-center p-4 sm:p-6 border-b">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div> 
        <div className="p-4 sm:p-6">{children}</div> 
      </div> 
    </div> 
  ); 
};

const ProductModal = ({ isOpen, onClose, product, onSave, restaurants = [] }) => {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    setImagePreview(product?.image || null);
    setImageFile(null);
  }, [product]);

  const handleImageChange = (event) => {
    if (event.currentTarget.files && event.currentTarget.files[0]) {
      const file = event.currentTarget.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const formik = useFormik({
    initialValues: {
      name: product?.name || '', description: product?.description || '', price: product?.price || '', category: product?.category || '', restaurantId: product?.restaurantId || '', isAvailable: product?.isAvailable ?? true,
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Product name is required"), price: Yup.number().positive("Price must be positive").required("Price is required"), category: Yup.string().required("Category is required"), restaurantId: Yup.string().required("Please select a restaurant"),
    }),
    enableReinitialize: true,
    onSubmit: (values) => {
      const restaurantName = restaurants.find(r => r.id === values.restaurantId)?.restaurantsName || '';
      onSave({ ...product, ...values, restaurant: restaurantName }, imageFile);
    },
  });

  return (
    <FormModal isOpen={isOpen} onClose={onClose} title={product ? "Edit Product" : "Add New Product"}>
      <form onSubmit={formik.handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <InputField label="Product Name" name="name" {...formik.getFieldProps('name')} error={formik.touched.name && formik.errors.name} helperText={formik.errors.name} />
          <InputField label="Price" name="price" type="number" {...formik.getFieldProps('price')} error={formik.touched.price && formik.errors.price} helperText={formik.errors.price} />
        </div>
        <TextareaField label="Description" name="description" {...formik.getFieldProps('description')} />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
          <div className="mt-1 flex items-center gap-4">
            {imagePreview && <img src={imagePreview} alt="Preview" className="w-20 h-20 rounded-md object-cover" />}
            <input type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <SelectField label="Category" name="category" {...formik.getFieldProps('category')} options={["Biriyani", "Drinks", "Dessert", "Main Course", "Appetizers", "Salads", "Soups", "Snacks"].map(c => ({ label: c, value: c }))} error={formik.touched.category && formik.errors.category} helperText={formik.errors.category} />
          <SelectField label="Restaurant" name="restaurantId" {...formik.getFieldProps('restaurantId')} options={(Array.isArray(restaurants) ? restaurants : []).map(r => ({ label: r.restaurantsName, value: r.id }))} error={formik.touched.restaurantId && formik.errors.restaurantId} helperText={formik.errors.restaurantId} />
          <SelectField label="Status" name="isAvailable" value={formik.values.isAvailable} onChange={(e) => formik.setFieldValue('isAvailable', e.target.value === 'true')} options={[{ label: 'Available', value: true }, { label: 'Unavailable', value: false }]} />
        </div>
        <div className="flex justify-end space-x-4 pt-4 sm:pt-6">
          <button type="button" onClick={onClose} className="px-6 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
          <button type="submit" className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center space-x-2">
            <Save className="w-4 h-4" /><span>Save Product</span>
          </button>
        </div>
      </form>
    </FormModal>
  );
};

const RestaurantModal = ({ isOpen, onClose, restaurant, onSave }) => {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    setImagePreview(restaurant?.image || null);
    setImageFile(null);
  }, [restaurant]);

  const handleImageChange = (event) => {
    if (event.currentTarget.files && event.currentTarget.files[0]) {
      const file = event.currentTarget.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const formik = useFormik({
    initialValues: {
      restaurantsName: restaurant?.restaurantsName || '', description: restaurant?.description || '', cuisine: Array.isArray(restaurant?.cuisine) ? restaurant.cuisine.join(', ') : '', rating: restaurant?.rating || 0, isActive: restaurant?.isActive ?? true, address: { street: restaurant?.address?.street || '', city: restaurant?.address?.city || '', state: restaurant?.address?.state || '', pincode: restaurant?.address?.pincode || '', }, contact: { phone: restaurant?.contact?.phone || '', email: restaurant?.contact?.email || '', }, openingHours: { open: restaurant?.openingHours?.open || '09:00', close: restaurant?.openingHours?.close || '22:00', },
    },
    validationSchema: Yup.object({
      restaurantsName: Yup.string().required("Restaurant name is required"), cuisine: Yup.string().required("Cuisine type(s) are required."), rating: Yup.number().min(0).max(5).required("Rating is required"),
      // Add other validations as needed
    }),
    enableReinitialize: true,
    onSubmit: (values) => {
      const submissionData = { ...restaurant, ...values, cuisine: values.cuisine.split(',').map(c => c.trim()).filter(Boolean) };
      onSave(submissionData, imageFile);
    },
  });

  return (
    <FormModal isOpen={isOpen} onClose={onClose} title={restaurant ? "Edit Restaurant" : "Add New Restaurant"}>
      <form onSubmit={formik.handleSubmit} className="space-y-4 sm:space-y-6">
        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Basic Information</h3>
        {/* ... Other restaurant form fields ... */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <InputField label="Restaurant Name" name="restaurantsName" {...formik.getFieldProps('restaurantsName')} error={formik.touched.restaurantsName && formik.errors.restaurantsName} helperText={formik.errors.restaurantsName} />
            <InputField label="Cuisine (comma-separated)" name="cuisine" {...formik.getFieldProps('cuisine')} error={formik.touched.cuisine && formik.errors.cuisine} helperText={formik.errors.cuisine} />
        </div>
        <TextareaField label="Description" name="description" {...formik.getFieldProps('description')} />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant Image</label>
          <div className="mt-1 flex items-center gap-4">
            {imagePreview && <img src={imagePreview} alt="Preview" className="w-20 h-20 rounded-md object-cover" />}
            <input type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100" />
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4 sm:pt-6">
          <button type="button" onClick={onClose} className="px-6 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
          <button type="submit" className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center space-x-2">
            <Save className="w-4 h-4" /><span>Save Restaurant</span>
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
      <div className="bg-white rounded-xl p-8 max-w-sm w-full"> 
        <h3 className="text-lg font-bold text-gray-900">Confirm Deletion</h3> 
        <p className="text-gray-600 mt-2">Are you sure you want to delete <span className="font-semibold">{itemName}</span>? This action cannot be undone.</p> 
        <div className="flex justify-end space-x-4 mt-6"> 
          <button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button> 
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg">Delete</button> 
        </div> 
      </div> 
    </div> 
  ); 
};

const InputField = ({ label, error, helperText, ...props }) => ( 
  <div> 
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label> 
    <input {...props} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-red-500 ${ error ? 'border-red-500 ring-red-200' : 'border-gray-300 focus:ring-red-200' }`} /> 
    {error && <p className="mt-1 text-xs text-red-600">{helperText}</p>} 
  </div> 
);

const TextareaField = ({ label, error, helperText, ...props }) => ( 
  <div> 
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label> 
    <textarea {...props} rows="3" className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-red-500 ${ error ? 'border-red-500 ring-red-200' : 'border-gray-300 focus:ring-red-200' }`} /> 
    {error && <p className="mt-1 text-xs text-red-600">{helperText}</p>} 
  </div> 
);

const SelectField = ({ label, options, error, helperText, ...props }) => ( 
  <div> 
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label> 
    <select {...props} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-red-500 ${ error ? 'border-red-500 ring-red-200' : 'border-gray-300 focus:ring-red-200' }`}> 
      <option value="">Select {label.toLowerCase()}</option> 
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)} 
    </select> 
    {error && <p className="mt-1 text-xs text-red-600">{helperText}</p>} 
  </div> 
);

export default AdminDashboard;