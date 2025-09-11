import React from 'react';

const OrderStatus = ({ status }) => {
  const getStatusColor = () => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-md p-4 max-w-xs">
      <div className="flex items-center">
        <div className={`${getStatusColor()} px-3 py-1 rounded-full text-sm font-medium`}>
          {status}
        </div>
        <div className="ml-3">
          <h3 className="font-semibold">Order Status Update</h3>
          <p className="text-sm text-gray-500">Your order has been updated</p>
        </div>
      </div>
      <div className="mt-3 flex justify-between text-sm">
        <span>Estimated Delivery:</span>
        <span>Tomorrow</span>
      </div>
    </div>
  );
};

export default OrderStatus;