import React, { useState, useEffect } from 'react';
import { MapPin, X, Edit2, Plus, Loader2, Navigation, Search } from 'lucide-react';

const AddressSelectionModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  userProfile 
}) => {
  const [useSavedAddress, setUseSavedAddress] = useState(true);
  const [formData, setFormData] = useState({
    address: '',
    pincode: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  useEffect(() => {
    if (isOpen && userProfile?.address && userProfile?.pincode) {
      setUseSavedAddress(true);
      setFormData({
        address: userProfile.address,
        pincode: userProfile.pincode
      });
    } else if (isOpen) {
      setUseSavedAddress(false);
    }
  }, [isOpen, userProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Search places using OpenStreetMap Nominatim API
  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=5`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching location:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectPlace = (place) => {
    setFormData({
      address: place.display_name,
      pincode: '' // User will need to enter pincode
    });
    setSearchQuery(place.display_name);
    setSearchResults([]);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });

        // Reverse geocoding to get address
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          
          setFormData({
            address: data.display_name,
            pincode: data.address?.postcode || ''
          });
          setSearchQuery(data.display_name);
        } catch (error) {
          console.error('Error getting address:', error);
        } finally {
          setLoadingLocation(false);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to retrieve your location');
        setLoadingLocation(false);
      }
    );
  };

  const handleConfirm = () => {
    let addressToUse;

    if (useSavedAddress && userProfile?.address) {
      addressToUse = {
        address: userProfile.address,
        pincode: userProfile.pincode
      };
    } else {
      if (!formData.address.trim() || !formData.pincode.trim()) {
        alert('Please fill in all address fields');
        return;
      }
      addressToUse = formData;
    }

    onConfirm(addressToUse);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MapPin className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-bold text-gray-800">Select Delivery Address</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Saved Address Option */}
          {userProfile?.address && userProfile?.pincode && (
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-orange-300 cursor-pointer transition">
                <input
                  type="radio"
                  name="addressType"
                  checked={useSavedAddress}
                  onChange={() => setUseSavedAddress(true)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-orange-500" />
                    <span className="font-semibold text-gray-800">Saved Address</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {userProfile.address}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Pincode: {userProfile.pincode}
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* Use Different Address Option */}
          <div className="space-y-3">
            <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-orange-300 cursor-pointer transition">
              <input
                type="radio"
                name="addressType"
                checked={!useSavedAddress}
                onChange={() => setUseSavedAddress(false)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-orange-500" />
                  <span className="font-semibold text-gray-800">Use Different Address</span>
                </div>
              </div>
            </label>

            {/* Different Address Form */}
            {!useSavedAddress && (
              <div className="pl-8 space-y-4">
                {/* Current Location Button */}
                <button
                  onClick={getCurrentLocation}
                  disabled={loadingLocation}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition font-medium"
                >
                  {loadingLocation ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Getting Location...
                    </>
                  ) : (
                    <>
                      <Navigation className="w-5 h-5" />
                      Use Current Location
                    </>
                  )}
                </button>

                {/* Search Location */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Location
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      placeholder="Search for area, street name..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                    />
                  </div>

                  {/* Search Results Dropdown */}
                  {searchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {searchResults.map((place, index) => (
                        <button
                          key={index}
                          onClick={() => handleSelectPlace(place)}
                          className="w-full text-left px-4 py-3 hover:bg-orange-50 transition border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-orange-500 mt-1 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{place.display_name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {isSearching && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-orange-500" />
                    </div>
                  )}
                </div>

                {/* Complete Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Complete Address *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="House/Flat No., Street, Area, Landmark"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none"
                  />
                </div>

                {/* Pincode */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="Enter 6-digit pincode"
                    maxLength={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  />
                </div>

                {/* Map Preview */}
                {currentLocation && (
                  <div className="rounded-xl overflow-hidden border border-gray-200">
                    <iframe
                      width="100%"
                      height="250"
                      frameBorder="0"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${currentLocation.lng - 0.01},${currentLocation.lat - 0.01},${currentLocation.lng + 0.01},${currentLocation.lat + 0.01}&layer=mapnik&marker=${currentLocation.lat},${currentLocation.lng}`}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleConfirm}
            className="w-full bg-orange-500 text-white py-4 rounded-lg font-semibold hover:bg-orange-600 transition shadow-lg hover:shadow-xl"
          >
            Confirm & Proceed to Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddressSelectionModal;