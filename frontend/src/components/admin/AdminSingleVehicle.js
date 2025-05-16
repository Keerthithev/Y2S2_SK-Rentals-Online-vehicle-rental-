"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import axios from "axios"
import { useNavigate, useParams } from "react-router-dom"
import Header from "../layouts/Header"
import Footer from "../layouts/Footer"
import { 
  FaEdit, 
  FaTrash, 
  FaArrowLeft, 
  FaChevronLeft, 
  FaChevronRight, 
  FaMapMarkerAlt,
  FaSync,
  FaExternalLinkAlt,
  FaCar,
  FaClock,
  FaTachometerAlt,
  FaServer,
  FaSpinner,
  FaPlug,
  FaWifi
} from "react-icons/fa"

const AdminSingleVehicle = () => {
  // State management
  const [state, setState] = useState({
    vehicle: null,
    loading: true,
    error: null,
    currentImageIndex: 0,
    isModalOpen: false,
    selectedImage: null,
    trackingData: null,
    isTracking: false,
    trackingError: null,
    refreshInterval: null,
    socket: null,
    connectionStatus: 'disconnected',
    reconnectAttempts: 0,
    lastPong: null
  })

  const { id } = useParams()
  const navigate = useNavigate()

  const { 
    vehicle, loading, error, currentImageIndex, isModalOpen, selectedImage,
    trackingData, isTracking, trackingError, refreshInterval, connectionStatus,
    reconnectAttempts, lastPong
  } = state

  // Helper to update state
  const updateState = (newState) => {
    setState(prev => ({ ...prev, ...newState }))
  }

  // Fetch with retry mechanism
  const fetchWithRetry = async (url, options, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await axios({
          url,
          ...options,
          timeout: 5000
        })
        return response.data
      } catch (err) {
        if (i === retries - 1) throw err
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
      }
    }
  }

  // Fetch vehicle details
  const fetchVehicleDetails = useCallback(async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("Authorization token is missing")

      updateState({ loading: true, error: null })

      const vehicleData = await fetchWithRetry(
        `http://localhost:1111/api/v1/admin/vehicle/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          method: 'GET'
        }
      )

      if (vehicleData.success && vehicleData.vehicle) {
        updateState({ 
          vehicle: vehicleData.vehicle, 
          loading: false,
          reconnectAttempts: 0
        })
        if (vehicleData.vehicle.trackId) {
          fetchTrackingData(vehicleData.vehicle.trackId)
          
        }
      } else {
        updateState({ 
          error: "Vehicle not found", 
          loading: false 
        })
      }
    } catch (err) {
      updateState({ 
        error: err.message || "Failed to fetch vehicle details",
        loading: false
      })
      console.error("Fetch error:", err)
    }
  }, [id])

  // Traccar token (should be stored securely in production)
  const traccarToken = "SDBGAiEA3l-Ps0dw8ND98J7EeoVfo5i2z3DrRLmM8lERqZ7tIQACIQCp4UZesAXC5-8iGhoowExdjvBpchQNyF_FXkNpS9GrlXsidSI6NzYxNTAsImUiOiIyMDI1LTA2LTIxVDE4OjMwOjAwLjAwMCswMDowMCJ9";

  const setupWebSocket = useCallback((trackId) => {
    if (!trackId || typeof trackId !== 'string' || !/^\d+$/.test(trackId)) {
      updateState({
        connectionStatus: 'disconnected',
        trackingError: "Invalid Traccar device ID - cannot connect"
      });
      return () => {}; // Return empty cleanup function
    }
    updateState({ connectionStatus: 'connecting' });
  
    const ws = new WebSocket(`wss://demo.traccar.org/api/socket?token=${encodeURIComponent(traccarToken)}`);
  
    let pingInterval;
    let reconnectTimeout;
    let lastDataTime = Date.now();
    const DATA_TIMEOUT = 60000; // 1 minute without data = consider disconnected
  
    const checkDataTimeout = () => {
      if (Date.now() - lastDataTime > DATA_TIMEOUT) {
        updateState({
          connectionStatus: 'disconnected',
          trackingError: "Device not sending data - may be offline"
        });
        cleanup();
      }
    };
  
    const dataTimeoutInterval = setInterval(checkDataTimeout, 10000);
  
    const cleanup = () => {
      clearInterval(pingInterval);
      clearInterval(dataTimeoutInterval);
      clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    };
  
    ws.onopen = () => {
      console.log("Connected to Traccar WebSocket");
      updateState({ 
        socket: ws,
        connectionStatus: 'connected',
        trackingError: null,
        reconnectAttempts: 0
      });
  
      // Send deviceId to filter updates
      ws.send(JSON.stringify({ deviceId: trackId }));
  
      // Set up ping/pong
      pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ ping: true }));
        }
      }, 25000);
    };
  
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
  
        if (data.pong) {
          updateState({ lastPong: Date.now() });
          return;
        }
  
        if (data.positions) {
          lastDataTime = Date.now();
          updateState({ 
            trackingData: data.positions[0],
            trackingError: null,
            connectionStatus: 'connected'
          });
        }
      } catch (err) {
        console.error("WebSocket message error:", err);
      }
    };
  
    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      updateState({
        trackingError: "Connection error - server may be overloaded",
        connectionStatus: 'disconnected'
      });
      cleanup();
    };
  
    ws.onclose = () => {
      console.log("WebSocket closed");
      cleanup();
      
      updateState(prev => ({ 
        connectionStatus: 'disconnected',
        reconnectAttempts: prev.reconnectAttempts + 1
      }));
  
      if (reconnectAttempts < 5) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        reconnectTimeout = setTimeout(() => {
          if (state.vehicle?.trackId) {
            setupWebSocket(state.vehicle.trackId);
          }
        }, delay);
      } else {
        updateState({
          trackingError: "Max connection attempts reached. Please refresh the page."
        });
      }
    };
  
    return cleanup;
  }, [reconnectAttempts]);


  const getDeviceIdFromUniqueId = async (uniqueId) => {
    try {
      const response = await fetch("https://demo.traccar.org/api/devices", {
        headers: {
          'Authorization': `Bearer ${traccarToken}`,
          'Accept': 'application/json'
        }
      });
  
      if (!response.ok) throw new Error("Failed to fetch devices");
  
      const devices = await response.json();
      const matched = devices.find(device => device.uniqueId === uniqueId);
  
      return matched?.id || null;
    } catch (err) {
      console.error("Device ID fetch error:", err);
      return null;
    }
  };

  
  const fetchTrackingData = useCallback(async (trackId) => {
    if (!trackId || typeof trackId !== 'string' || !/^\d+$/.test(trackId)) {
      updateState({ 
        trackingError: "Invalid Traccar device ID format",
        isTracking: false
      });
      return;
    }
  
    try {
      updateState({ isTracking: true, trackingError: null });
  
      const deviceId = await getDeviceIdFromUniqueId(trackId);
if (!deviceId) {
  updateState({
    trackingError: "No matching deviceId found for this trackId",
    isTracking: false,
  });
  return;
}

const response = await fetch(`https://demo.traccar.org/api/positions?deviceId=${deviceId}`, {

        method: 'GET',
        headers: {
          'Authorization': `Bearer ${traccarToken}`,
          'Accept': 'application/json'
        }
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || 
          `HTTP error! status: ${response.status}`
        );
      }
  
  
      const positions = await response.json();
  
      if (positions && positions.length > 0) {
        updateState({
          trackingData: positions[0],
          isTracking: false,
        });
      } else {
        updateState({
          trackingError: "No position data available for this device",
          isTracking: false,
        });
      }
  
    } catch (err) {
      console.error("Tracking error:", err);
      updateState({
        trackingError: `Failed to fetch tracking data: ${err.message}`,
        isTracking: false,
      });
    }
  }, [traccarToken]);
  // Auto-refresh management
  const startAutoRefresh = useCallback((trackId) => {
    if (refreshInterval) clearInterval(refreshInterval);
    fetchTrackingData(trackId);
    const interval = setInterval(() => fetchTrackingData(trackId), 20000);
    updateState({ refreshInterval: interval });
  }, [refreshInterval, fetchTrackingData]);

  const stopAutoRefresh = useCallback(() => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      updateState({ refreshInterval: null });
    }
  }, [refreshInterval]);

  // Initial data load
  useEffect(() => {
    fetchVehicleDetails();
    return () => {
      stopAutoRefresh();
      if (state.socket) {
        state.socket.close();
      }
    };
  }, [fetchVehicleDetails, stopAutoRefresh]);

  // WebSocket setup when vehicle is loaded
  useEffect(() => {
    if (vehicle?.trackId) {
      const cleanup = setupWebSocket(vehicle.trackId);
      return cleanup;
    }
  }, [vehicle?.trackId, setupWebSocket]);

  // Vehicle actions
  const deleteVehicle = async (id) => {
    try {
      const confirm = window.confirm("Are you sure you want to delete this vehicle?");
      if (confirm) {
        await axios.delete(`http://localhost:1111/api/v1/admin/vehicle/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        alert("Vehicle deleted successfully");
        navigate("/listvehicle");
      }
    } catch (err) {
      updateState({ error: err.message || "Failed to delete vehicle" });
    }
  };

  // Image handlers
  const nextImage = () => {
    if (vehicle?.images?.length > 0) {
      updateState({ 
        currentImageIndex: (currentImageIndex + 1) % vehicle.images.length 
      });
    }
  };

  const prevImage = () => {
    if (vehicle?.images?.length > 0) {
      updateState({ 
        currentImageIndex: currentImageIndex === 0 ? vehicle.images.length - 1 : currentImageIndex - 1 
      });
    }
  };

  const openModal = (image) => {
    updateState({ 
      selectedImage: image, 
      isModalOpen: true 
    });
  };

  const closeModal = () => {
    updateState({ 
      isModalOpen: false, 
      selectedImage: null 
    });
  };

  const openTraccarMap = () => {
    if (!vehicle?.trackId) {
      updateState({ trackingError: "No Traccar ID assigned" });
      return;
    }
    window.open(`https://demo.traccar.org/?deviceId=${vehicle.trackId}`, '_blank');
  };

  // Format helpers
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, { 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString();
  };

  // Connection status component
  const ConnectionStatus = () => {
    let statusText, statusColor, statusIcon, additionalText;
    
    // Check if we have tracking data but it's stale
    const isDataStale = trackingData && 
      (Date.now() - new Date(trackingData.deviceTime).getTime() > 30000); // 2 minutes
    
    if (isDataStale) {
      statusText = 'Device Offline';
      statusColor = 'text-red-500';
      statusIcon = <FaPlug className="ml-2" />;
      additionalText = ' (No recent data)';
    } else {
      switch (connectionStatus) {
        case 'connected':
          statusText = 'Connected';
          statusColor = 'text-green-500';
          statusIcon = <FaWifi className="ml-2" />;
          additionalText = trackingData ? '' : ' (Waiting for data...)';
          break;
        case 'connecting':
          statusText = 'Connecting...';
          statusColor = 'text-yellow-500';
          statusIcon = <FaSpinner className="animate-spin ml-2" />;
          break;
        default:
          statusText = 'Disconnected';
          statusColor = 'text-red-500';
          statusIcon = <FaPlug className="ml-2" />;
      }
    }
    
    return (
      <div className="flex flex-col">
        <div className={`flex items-center ${statusColor}`}>
          <span className="w-2 h-2 rounded-full bg-current mr-2"></span>
          {statusText}
          {statusIcon}
        </div>
        {additionalText && (
          <div className="text-xs text-gray-500 mt-1">{additionalText}</div>
        )}
      </div>
    );
  };
  // Memoized TrackingInfo component
  const TrackingInfo = useMemo(() => {
    if (!vehicle?.trackId) {
      return (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-lg">
          <div className="flex items-center">
            <FaMapMarkerAlt className="text-yellow-500 mr-2" />
            <p className="text-yellow-700">No Traccar ID assigned</p>
          </div>
        </div>
      );
    }
  
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center">
            <FaMapMarkerAlt className="mr-2 text-blue-500" />
            Real-time Tracking
            <div className="ml-4">
              <ConnectionStatus />
            </div>
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => fetchTrackingData(vehicle.trackId)}
              disabled={isTracking}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg transition-colors flex items-center gap-2 text-sm"
            >
              <FaSync className={isTracking ? "animate-spin" : ""} />
              {isTracking ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={openTraccarMap}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg transition-colors flex items-center gap-2 text-sm"
            >
              <FaExternalLinkAlt />
              Traccar Map
            </button>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          {trackingError && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-3 rounded-r">
              <div className="flex items-center">
                <FaPlug className="text-red-500 mr-2" />
                <p className="text-red-700">{trackingError}</p>
              </div>
              {connectionStatus === 'disconnected' && (
                <button 
                  onClick={() => setupWebSocket(vehicle.trackId)}
                  className="mt-2 text-sm text-blue-600 hover:underline flex items-center"
                >
                  <FaSync className="mr-1" /> Reconnect
                </button>
              )}
            </div>
          )}
          
          {trackingData ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex items-center mb-1">
                    <FaCar className="text-gray-500 mr-2" />
                    <span className="text-gray-500 text-sm">Device Status</span>
                  </div>
                  <p className="font-medium text-lg">
                    <span className={trackingData.speed > 0 ? "text-green-600" : "text-blue-600"}>
                      {trackingData.speed > 0 ? "Moving" : "Idle"}
                    </span>
                  </p>
                </div>
                
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex items-center mb-1">
                    <FaClock className="text-gray-500 mr-2" />
                    <span className="text-gray-500 text-sm">Last Update</span>
                  </div>
                  <p className="font-medium text-lg">
                    {formatDate(trackingData.deviceTime)}<br />
                    <span className="text-sm">{formatTime(trackingData.deviceTime)}</span>
                  </p>
                </div>
                
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex items-center mb-1">
                    <FaTachometerAlt className="text-gray-500 mr-2" />
                    <span className="text-gray-500 text-sm">Speed</span>
                  </div>
                  <p className="font-medium text-lg">
                    {trackingData.speed ? (
                      <span className="text-blue-600">{Math.round(trackingData.speed)} km/h</span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </p>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-700">
                    Location: {trackingData.latitude.toFixed(6)}, {trackingData.longitude.toFixed(6)}
                  </h4>
                  <a
                    href={`https://www.google.com/maps?q=${trackingData.latitude},${trackingData.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm flex items-center"
                  >
                    Open in Google Maps <FaExternalLinkAlt className="ml-1" />
                  </a>
                </div>
                
                <iframe
                  width="100%"
                  height="300"
                  frameBorder="0"
                  style={{ border: 0, borderRadius: '8px' }}
                  src={`https://maps.google.com/maps?q=${trackingData.latitude},${trackingData.longitude}&z=15&output=embed`}
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              </div>
            </>
          ) : (
            <div className="flex justify-center items-center py-8">
              {isTracking ? (
                <FaSpinner className="animate-spin text-2xl text-blue-500" />
              ) : (
                <p className="text-gray-500">No tracking data available</p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }, [vehicle?.trackId, trackingData, isTracking, trackingError, connectionStatus]);

  // Main render
  return (
    <div className="bg-gray-100 min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/listvehicle")}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            <FaArrowLeft /> Back to Vehicle List
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Vehicle Details</h1>
          <div className="w-24"></div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          vehicle && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                {/* Left Column - Images */}
                <div className="lg:col-span-1 bg-gray-50 p-6">
                  <div className="relative mb-4 bg-white rounded-lg shadow-sm overflow-hidden">
                    {vehicle.images?.length > 0 ? (
                      <div className="aspect-w-3 aspect-h-2">
                        <img
                          src={vehicle.images[currentImageIndex]?.url || "/placeholder.svg"}
                          alt={`${vehicle.name}`}
                          className="w-full h-full object-contain cursor-pointer"
                          onClick={() => openModal(vehicle.images[currentImageIndex]?.url)}
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="aspect-w-3 aspect-h-2 flex items-center justify-center bg-gray-100">
                        <p className="text-gray-400">No image available</p>
                      </div>
                    )}

                    {vehicle.images?.length > 1 && (
                      <div className="absolute inset-0 flex items-center justify-between px-2">
                        <button
                          onClick={prevImage}
                          className="bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md transition-all"
                          aria-label="Previous image"
                        >
                          <FaChevronLeft />
                        </button>
                        <button
                          onClick={nextImage}
                          className="bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md transition-all"
                          aria-label="Next image"
                        >
                          <FaChevronRight />
                        </button>
                      </div>
                    )}
                  </div>

                  {vehicle.images?.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto py-2">
                      {vehicle.images.map((image, index) => (
                        <div
                          key={index}
                          className={`w-16 h-16 flex-shrink-0 cursor-pointer rounded-md overflow-hidden border-2 ${
                            currentImageIndex === index ? "border-blue-500" : "border-transparent"
                          }`}
                          onClick={() => updateState({ currentImageIndex: index })}
                        >
                          <img
                            src={image.url || "/placeholder.svg"}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-6 flex flex-col gap-3">
                    <button
                      onClick={() => navigate(`/editvehicle/${vehicle._id}`)}
                      className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg transition-colors w-full"
                    >
                      <FaEdit /> Edit Vehicle
                    </button>
                    <button
                      onClick={() => deleteVehicle(vehicle._id)}
                      className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-lg transition-colors w-full"
                    >
                      <FaTrash /> Delete Vehicle
                    </button>
                  </div>
                </div>

                {/* Right Column - Details */}
                <div className="lg:col-span-2 p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-800">{vehicle.name}</h2>
                      <p className="text-gray-500 text-lg">
                        {vehicle.brand} {vehicle.model} • {vehicle.year}
                      </p>
                    </div>
                    <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-semibold">
                      Rs.{vehicle.rentPerDay}.00 / day
                    </div>
                  </div>

                  {/* Tracking Info Section */}
                  {TrackingInfo}

                  {/* Vehicle Specifications */}
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Specifications</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8">
                      {[
                        { label: "Fuel Type", value: vehicle.fuelType },
                        { label: "Transmission", value: vehicle.transmission },
                        { label: "Seating Capacity", value: `${vehicle.seatingCapacity} seats` },
                        { label: "License Plate", value: vehicle.licensePlateNumber },
                        { label: "Vehicle Type", value: vehicle.vehicleType },
                        { label: "Mileage", value: `${vehicle.mileage} km` }
                      ].map((item, index) => (
                        <div key={index} className="flex flex-col">
                          <span className="text-gray-500 text-sm">{item.label}</span>
                          <span className="font-medium text-gray-800">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status Information */}
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Status</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { 
                          label: "Availability", 
                          value: vehicle.availableStatus ? "Available" : "Not Available",
                          color: vehicle.availableStatus ? "bg-green-500" : "bg-red-500"
                        },
                        { 
                          label: "Performance Tuning", 
                          value: vehicle.isTuned ? "Performance Tuned" : "Standard",
                          color: vehicle.isTuned ? "bg-blue-500" : "bg-gray-400"
                        }
                      ].map((status, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg">
                          <span className="text-gray-500 text-sm">{status.label}</span>
                          <div className="flex items-center mt-1">
                            <span className={`w-3 h-3 rounded-full mr-2 ${status.color}`}></span>
                            <span className="font-medium text-gray-800">{status.value}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Insurance & Description */}
                  <div>
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">Insurance</h3>
                      <p className="text-gray-700">
                        Last Insurance Date:{" "}
                        <span className="font-medium">{formatDate(vehicle.lastInsuranceDate)}</span>
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">Description</h3>
                      <p className="text-gray-700 whitespace-pre-line">{vehicle.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        )}

        {/* Image Modal */}
        {isModalOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
            onClick={closeModal}
          >
            <div
              className="relative max-w-5xl w-full bg-white rounded-xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={closeModal}
                  className="bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition-colors"
                  aria-label="Close modal"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <img
                src={selectedImage || "/placeholder.svg"}
                alt="Large view"
                className="w-full h-auto max-h-[80vh] object-contain p-2"
                loading="eager"
              />
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default AdminSingleVehicle;