import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const InvoiceCard = ({ invoice, onPay }) => {
  const [paying, setPaying] = useState(false);
  const navigate = useNavigate();

  const handlePay = () => {
    setPaying(true);
    // Simulate payment processing
    setTimeout(() => {
      setPaying(false);
      onPay && onPay(invoice);
      toast.success('Payment successful!');
      navigate(invoice.paymentLink);
    }, 2000);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-md p-4 max-w-xs">
      <h3 className="font-bold text-lg border-b pb-2">Invoice #{invoice.id}</h3>
      
      <div className="my-3">
        {invoice.items.map((item, index) => (
          <div key={index} className="flex justify-between py-1">
            <span>{item.name} x {item.quantity}</span>
            <span>${item.price * item.quantity}</span>
          </div>
        ))}
      </div>
      
      <div className="flex justify-between font-bold border-t pt-2">
        <span>Total:</span>
        <span>${invoice.total}</span>
      </div>
      
      <button
        onClick={handlePay}
        disabled={paying}
        className={`w-full mt-4 py-2 rounded-lg text-white font-medium ${
          paying ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
        }`}
      >
        {paying ? 'Processing...' : 'Pay Now'}
      </button>
    </div>
  );
};

export default InvoiceCard;