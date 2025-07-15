import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DriveFileRenameOutlineOutlinedIcon from '@mui/icons-material/DriveFileRenameOutlineOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../../api/api';
import { get_dashboard_index_data, messageClear } from '../../store/reducers/dashboardReducer';
import { user_reset } from '../../store/reducers/authReducer';
import { reset_count } from '../../store/reducers/cardReducer';
import { update_profile } from '../../store/reducers/dashboardReducer';

const Profile = () => {
  const { userInfo } = useSelector(state => state.auth);
  const { successMessage, errorMessage, loading } = useSelector(state => state.dashboard);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: userInfo.name || '',
    email: userInfo.email || '',
    currentPassword: '',
    newPassword: ''
  });

  const [strength, setStrength] = useState('');

  useEffect(() => {
    if (userInfo?.id) {
      dispatch(get_dashboard_index_data());
    }
  }, [dispatch, userInfo?.id]);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: 'bg-orange-100 text-orange-700 border border-orange-300',
        onClose: () => dispatch(messageClear())
      });
    }

    if (errorMessage) {
      const isSecurityError = errorMessage.includes('Session expired - security revision');
      
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: 'bg-red-100 text-red-700 border border-red-300',
        onClose: isSecurityError ? () => {
          localStorage.removeItem('customerToken');
          dispatch(user_reset());
          navigate('/login');
        } : undefined
      });
    }
  }, [successMessage, errorMessage, dispatch, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.currentPassword) {
      toast.error('Current password is required', {
        className: 'bg-red-100 text-red-700 border border-red-300'
      });
      return;
    }

    if (formData.newPassword && strength !== 'Strong') {
      toast.error('Password must be strong (8+ chars with uppercase, number, and special char)', {
        className: 'bg-red-100 text-red-700 border border-red-300'
      });
      return;
    }

    try {
      await dispatch(update_profile({
        userId: userInfo.id,
        updates: {
          name: formData.name,
          email: formData.email,
          newPassword: formData.newPassword,
          currentPassword: formData.currentPassword
        }
      })).unwrap();

      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: ''
      }));

      if (formData.newPassword) {
        toast.success('Password updated. Please login again.', {
          className: 'bg-green-100 text-green-700 border border-green-300',
          onClose: () => {
            localStorage.removeItem('customerToken');
            dispatch(user_reset());
            navigate('/login');
          }
        });
      } else {
        toast.success('Profile updated successfully', {
          className: 'bg-green-100 text-green-700 border border-green-300'
        });
      }

    } catch (error) {
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: ''
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'newPassword') {
      setStrength(checkPasswordStrength(value));
    }
  };

  const checkPasswordStrength = (pass) => {
    const hasLower = /[a-z]/.test(pass);
    const hasUpper = /[A-Z]/.test(pass);
    const hasNumber = /\d/.test(pass);
    const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pass);
    const length = pass.length;

    let score = 0;
    if (length >= 8) score++;
    if (hasLower) score++;
    if (hasUpper) score++;
    if (hasNumber) score++;
    if (hasSpecial) score++;

    if (!pass.length) return 'Empty';
    if (score < 2) return 'Insecure';
    if (score < 3) return 'Weak';
    if (score < 4) return 'Medium';
    return 'Strong';
  };

  const getStrengthColor = () => {
    switch (strength) {
      case 'Insecure': return 'text-red-600';
      case 'Weak': return 'text-orange-600';
      case 'Medium': return 'text-yellow-600';
      case 'Strong': return 'text-green-600';
      default: return 'text-gray-400';
    }
  };

  const validatePassword = (pass) => {
    const errors = [];
    if (pass.length < 8) errors.push('At least 8 characters');
    if (!/[A-Z]/.test(pass)) errors.push('One uppercase letter');
    if (!/\d/.test(pass)) errors.push('One number');
    if (!/[!@#$%^&*]/.test(pass)) errors.push('One special character');
    return errors;
  };

  const logout = async () => {
    try {
      await api.get('/customer-logout');
      localStorage.removeItem('customerToken');
      dispatch(user_reset());
      dispatch(reset_count());
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error.response?.data || error.message);
    }
  };

  return (
    <div className="bg-white flex justify-center">
      <ToastContainer
        toastClassName="relative flex p-4 min-h-10 rounded-md justify-between overflow-hidden cursor-pointer shadow-lg"
        bodyClassName="text-sm flex"
      />

      <div className="w-full max-w-4xl bg-white mt-1 lg:mt-10 rounded-2xl p-2 pb-24 lg:pb-0 px-7">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-4 lg:mb-8">My Profile</h1>

        <div className="flex items-center mb-8">
          <div className="relative">
            <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center">
              <span className='w-[90%] h-[90%] bg-black-500 border border-white rounded-full flex items-center justify-center'>
                <span className="text-white text-3xl font-bold">
                  {userInfo.name.charAt(0).toUpperCase() || 'R'}
                </span>
              </span>
            </div>
          </div>
          <h2 className="ml-6 text-medium font-bold text-gray-800">{userInfo.name}</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Change Name <DriveFileRenameOutlineOutlinedIcon className='text-orange-400' />
              </label>
              <input
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Change Email <DriveFileRenameOutlineOutlinedIcon className='text-orange-400' />
              </label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Current Password <DriveFileRenameOutlineOutlinedIcon className='text-orange-400' />
              </label>
              <input
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Enter current password"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                New Password <DriveFileRenameOutlineOutlinedIcon className='text-orange-400' />
              </label>
              <div className="flex items-center gap-2">
                <input
                  name="newPassword"
                  type="password"
                  placeholder="Enter new password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50"
                  pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}"
                  title="Must contain 8+ characters with uppercase, number, and special character"
                />
                <span className={`font-medium text-sm ${getStrengthColor()}`}>
                  {strength || 'Password Strength'}
                </span>
              </div>
              {formData.newPassword && (
                <div className="mt-2 text-xs text-gray-600">
                  {validatePassword(formData.newPassword).map((error, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <ErrorOutlineOutlinedIcon className="text-red-500 text-xs" />
                      <span>{error}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-gray-700 hover:bg-orange-600 text-white font-semibold rounded-lg shadow-md transition-all duration-200 disabled:opacity-70"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

        <button
          onClick={logout}
          className="w-full mt-2 px-6 py-3 block lg:hidden bg-white hover:bg-orange-100 border border-orange-500 text-orange-600 font-semibold rounded-lg transition-all duration-200"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;