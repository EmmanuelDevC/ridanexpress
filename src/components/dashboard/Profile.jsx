"use client"

import { useDispatch, useSelector } from "react-redux"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import {
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiSave,
  FiLogOut,
  FiCamera,
  FiShield,
  FiCheck,
  FiX,
  FiAlertCircle,
} from "react-icons/fi"
import { HiOutlineSparkles } from "react-icons/hi"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import api from "../../api/api"
import { get_dashboard_index_data, messageClear } from "../../store/reducers/dashboardReducer"
import { user_reset } from "../../store/reducers/authReducer"
import { reset_count } from "../../store/reducers/cardReducer"
import { update_profile } from "../../store/reducers/dashboardReducer"

const Profile = () => {
  const { userInfo } = useSelector((state) => state.auth)
  const { successMessage, errorMessage, loading } = useSelector((state) => state.dashboard)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: userInfo.name || "",
    email: userInfo.email || "",
    currentPassword: "",
    newPassword: "",
  })

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
  })

  const [strength, setStrength] = useState("")
  const [activeTab, setActiveTab] = useState("profile")

  useEffect(() => {
    if (userInfo?.id) {
      dispatch(get_dashboard_index_data())
    }
  }, [dispatch, userInfo?.id])

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: "bg-green-50 text-green-800 border border-green-200",
        onClose: () => dispatch(messageClear()),
      })
    }
    if (errorMessage) {
      const isSecurityError = errorMessage.includes("Session expired - security revision")

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: "bg-red-50 text-red-800 border border-red-200",
        onClose: isSecurityError
          ? () => {
            localStorage.removeItem("customerToken")
            dispatch(user_reset())
            navigate("/login")
          }
          : undefined,
      })
    }
  }, [successMessage, errorMessage, dispatch, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.currentPassword) {
      toast.error("Current password is required", {
        className: "bg-red-50 text-red-800 border border-red-200",
      })
      return
    }

    if (formData.newPassword && strength !== "Strong") {
      toast.error("Password must be strong (8+ chars with uppercase, number, and special char)", {
        className: "bg-red-50 text-red-800 border border-red-200",
      })
      return
    }

    try {
      await dispatch(
        update_profile({
          userId: userInfo.id,
          updates: {
            name: formData.name,
            email: formData.email,
            newPassword: formData.newPassword,
            currentPassword: formData.currentPassword,
          },
        }),
      ).unwrap()

      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
      }))

      if (formData.newPassword) {
        toast.success("Password updated. Please login again.", {
          className: "bg-green-50 text-green-800 border border-green-200",
          onClose: () => {
            localStorage.removeItem("customerToken")
            dispatch(user_reset())
            navigate("/login")
          },
        })
      } else {
        toast.success("Profile updated successfully", {
          className: "bg-green-50 text-green-800 border border-green-200",
        })
      }
    } catch (error) {
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
      }))
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (name === "newPassword") {
      setStrength(checkPasswordStrength(value))
    }
  }

  const checkPasswordStrength = (pass) => {
    const hasLower = /[a-z]/.test(pass)
    const hasUpper = /[A-Z]/.test(pass)
    const hasNumber = /\d/.test(pass)
    const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pass)
    const length = pass.length

    let score = 0
    if (length >= 8) score++
    if (hasLower) score++
    if (hasUpper) score++
    if (hasNumber) score++
    if (hasSpecial) score++

    if (!pass.length) return ""
    if (score < 2) return "Very Weak"
    if (score < 3) return "Weak"
    if (score < 4) return "Medium"
    return "Strong"
  }

  const getStrengthColor = () => {
    switch (strength) {
      case "Very Weak":
        return "text-red-600 bg-red-100"
      case "Weak":
        return "text-orange-600 bg-orange-100"
      case "Medium":
        return "text-yellow-600 bg-yellow-100"
      case "Strong":
        return "text-green-600 bg-green-100"
      default:
        return "text-gray-400 bg-gray-100"
    }
  }

  const getPasswordRequirements = (pass) => {
    return [
      { text: "At least 8 characters", met: pass.length >= 8 },
      { text: "One uppercase letter", met: /[A-Z]/.test(pass) },
      { text: "One lowercase letter", met: /[a-z]/.test(pass) },
      { text: "One number", met: /\d/.test(pass) },
      { text: "One special character", met: /[!@#$%^&*]/.test(pass) },
    ]
  }

  const logout = async () => {
    try {
      await api.get("/customer-logout")
      localStorage.removeItem("customerToken")
      dispatch(user_reset())
      dispatch(reset_count())
      navigate("/login")
    } catch (error) {
      console.error("Logout error:", error.response?.data || error.message)
    }
  }

  const tabs = [
    { id: "profile", label: "Profile Info", icon: <FiUser /> },
    { id: "security", label: "Security", icon: <FiShield /> },
  ]

  return (
    <div className="space-y-6 lg:space-y-8">
      <ToastContainer
        toastClassName="relative flex p-4 min-h-10 rounded-xl justify-between overflow-hidden cursor-pointer shadow-lg"
        bodyClassName="text-sm flex"
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-gray-900 via-black to-gray-900 rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-400 rounded-full translate-y-24 -translate-x-24"></div>
        </div>

        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-6">
              {/* Profile Avatar */}
              <div className="relative">
                <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <span className="text-2xl lg:text-3xl font-bold text-white">
                    {userInfo.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <HiOutlineSparkles className="text-orange-400 text-xl" />
                  <h1 className="text-xl lg:text-3xl font-bold">Account Settings</h1>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={logout}
                    className="flex items-center space-x-2 bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm px-4 py-2.5 rounded-xl transition-all duration-300 border border-red-500/30 text-red-300 hover:text-red-200"
                  >
                    <FiLogOut className="text-lg" />
                    <span className="text-sm font-medium">Sign Out</span>
                  </button>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Verified
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6 lg:px-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors duration-300 ${activeTab === tab.id
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6 lg:p-8">
          {activeTab === "profile" && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
                <p className="text-gray-600">Update your account details and email address.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Name Field */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <FiUser className="text-orange-500" />
                      <span>Full Name</span>
                    </label>
                    <input
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                      placeholder="Enter your full name"
                    />
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                      <FiMail className="text-orange-500" />
                      <span>Email Address</span>
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>

                {/* Current Password */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <FiLock className="text-orange-500" />
                    <span>Current Password</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      name="currentPassword"
                      type={showPasswords.current ? "text" : "password"}
                      value={formData.currentPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                      placeholder="Enter your current password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords((prev) => ({ ...prev, current: !prev.current }))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.current ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-70"
                  >
                    <FiSave className="text-lg" />
                    <span>{loading ? "Saving..." : "Save Changes"}</span>
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}

          {activeTab === "security" && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-900">Security Settings</h3>
                <p className="text-gray-600">Update your password and security preferences.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Current Password */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <FiLock className="text-orange-500" />
                    <span>Current Password</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      name="currentPassword"
                      type={showPasswords.current ? "text" : "password"}
                      value={formData.currentPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                      placeholder="Enter your current password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords((prev) => ({ ...prev, current: !prev.current }))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.current ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700">
                    <FiShield className="text-orange-500" />
                    <span>New Password</span>
                  </label>
                  <div className="relative">
                    <input
                      name="newPassword"
                      type={showPasswords.new ? "text" : "password"}
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                      placeholder="Enter your new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords((prev) => ({ ...prev, new: !prev.new }))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.new ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>

                  {/* Password Strength */}
                  {formData.newPassword && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Password Strength:</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStrengthColor()}`}>
                          {strength}
                        </span>
                      </div>

                      {/* Password Requirements */}
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">Requirements:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {getPasswordRequirements(formData.newPassword).map((req, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              {req.met ? (
                                <FiCheck className="text-green-500 text-sm" />
                              ) : (
                                <FiX className="text-red-500 text-sm" />
                              )}
                              <span className={`text-xs ${req.met ? "text-green-600" : "text-gray-500"}`}>
                                {req.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <FiAlertCircle className="text-blue-500 text-lg mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold text-blue-900">Security Notice</h4>
                      <p className="text-sm text-blue-700">
                        Changing your password will log you out of all devices. You'll need to sign in again.
                      </p>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-70"
                >
                  <FiShield className="text-lg" />
                  <span>{loading ? "Updating..." : "Update Password"}</span>
                </motion.button>
              </form>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
