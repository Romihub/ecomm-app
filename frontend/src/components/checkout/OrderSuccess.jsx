import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

function OrderSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const orderDetails = location.state?.orderDetails;

  useEffect(() => {
    // Redirect to home if accessed directly without order details
    if (!orderDetails) {
      setTimeout(() => {
        navigate('/');
      }, 5000);
    }
  }, [orderDetails, navigate]);

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-2xl font-bold text-green-700">
            Order Successful!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {orderDetails ? (
            <>
              <div className="text-center text-gray-600 mb-6">
                <p>Order ID: {orderDetails.orderId}</p>
                <p>Amount Paid: ${orderDetails.amount.toFixed(2)}</p>
              </div>
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Order Items:</h3>
                <ul className="space-y-2">
                  {orderDetails.items.map((item) => (
                    <li key={item.id} className="flex justify-between">
                      <span>{item.name}</span>
                      <span>x{item.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <p className="text-center text-gray-600">
              Thank you for your purchase! You will be redirected to the homepage shortly.
            </p>
          )}
          <div className="flex justify-center space-x-4 mt-6">
            <Button
              onClick={() => navigate('/order-history')}
              variant="outline"
            >
              View Order History
            </Button>
            <Button
              onClick={() => navigate('/products')}
            >
              Continue Shopping
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default OrderSuccess;