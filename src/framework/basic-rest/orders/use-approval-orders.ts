import React from 'react';

// Hook to fetch pending approvals for DM/CM roles
export const useApprovalOrders = (enabled: boolean = true) => {
  const [orders, setOrders] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const BASE_API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  const fetchApprovalOrders = React.useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');

      const response = await fetch(`${BASE_API}/api/checkout/order/pending-approvals`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch pending approvals');
      }

      const data = await response.json();
      setOrders(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching approval orders:', err);
    } finally {
      setLoading(false);
    }
  }, [enabled, BASE_API]);

  React.useEffect(() => {
    if (enabled) {
      fetchApprovalOrders();
    }
  }, [enabled, fetchApprovalOrders]);

  return { orders, loading, error, refetch: fetchApprovalOrders };
};

// Hook for submitting approval
export const useSubmitApproval = () => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const BASE_API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  const submitApproval = React.useCallback(
    async (orderId: string, action: 'APPROVE' | 'DISAPPROVE', remarks?: string) => {
      setLoading(true);
      try {
        const token = localStorage.getItem('authToken') || localStorage.getItem('token');

        const response = await fetch(`${BASE_API}/api/checkout/${orderId}/approve`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            action,
            remarks: remarks || undefined,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to submit approval');
        }

        const result = await response.json();
        setError(null);
        return result;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [BASE_API]
  );

  return { submitApproval, loading, error };
};
