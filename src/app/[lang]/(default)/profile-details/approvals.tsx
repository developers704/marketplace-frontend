'use client';
import React, { useEffect, useState } from 'react';
import { useUserDataQuery } from '@/framework/basic-rest/user-data/use-user-data';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

interface ApprovalOrder {
  _id: string;
  orderId: string;
  customer: {
    username: string;
    email: string;
    phone_number: string;
    warehouse: Array<{ name: string }>;
  };
  items: Array<{
    product: { name: string };
    quantity: number;
    price: number;
  }>;
  grandTotal: number;
  orderStatus: string;
  approvalStatus: string;
  approvalHistory: Array<{
    role: string;
    status: string;
    date: string;
    remarks?: string;
  }>;
  createdAt: string;
}

interface ApprovalStats {
  pendingCount: number;
  approvedCount: number;
  disapprovedCount: number;
}

const Approvals = ({ lang }: { lang: string }) => {
  const [orders, setOrders] = useState<ApprovalOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<ApprovalOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<ApprovalStats>({
    pendingCount: 0,
    approvedCount: 0,
    disapprovedCount: 0,
  });
  const [filter, setFilter] = useState<'pending' | 'approved' | 'disapproved' | 'all'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<ApprovalOrder | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'APPROVE' | 'DISAPPROVE' | null>(null);
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data: user, isLoading: userLoading } = useUserDataQuery();
  const router = useRouter();

  const BASE_API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const userRole = user?.role?.role_name || 'User';
  const isApprover = userRole === 'district manager' || userRole === 'corporate manager';

  useEffect(() => {
    if (!isApprover) {
      router.push(`/${lang}/profile-details?option=Personal Info`);
    }
  }, [isApprover, router, lang]);

  const fetchOrders = async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await fetch(`${BASE_API}/api/checkout/order/pending-approvals`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch');

      const result = await response.json();
      const ordersData = result.data || [];

      // Fix warehouse array issue
      const formattedOrders = ordersData.map((order: any) => ({
        ...order,
        customer: {
          ...order.customer,
          warehouse: Array.isArray(order.customer.warehouse) ? order.customer.warehouse[0] : order.customer.warehouse,
        },
      }));

      setOrders(formattedOrders);
      calculateStats(formattedOrders);
      applyFilters(formattedOrders, filter, searchTerm);
    } catch (error: any) {
       const message = error.message || 'Something went wrong';
           toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (list: ApprovalOrder[]) => {
    setStats({
      pendingCount: list.filter(o => o.approvalStatus === 'PENDING').length,
      approvedCount: list.filter(o => o.approvalStatus === 'APPROVED').length,
      disapprovedCount: list.filter(o => o.approvalStatus === 'DISAPPROVED').length,
    });
  };

  const applyFilters = (list: ApprovalOrder[], filterType: string, search: string) => {
    let filtered = list;

    if (filterType !== 'all') {
      filtered = filtered.filter(o => o.approvalStatus === filterType.toUpperCase());
    }

    if (search) {
      const term = search.toLowerCase();
      filtered = filtered.filter(o =>
        o.orderId.toLowerCase().includes(term) ||
        o.customer.username.toLowerCase().includes(term) ||
        o.customer.email.toLowerCase().includes(term)
      );
    }

    setFilteredOrders(filtered);
  };

  useEffect(() => {
    if (!userLoading && user?._id && isApprover) fetchOrders();
  }, [user?._id, userLoading, isApprover]);

  useEffect(() => {
    applyFilters(orders, filter, searchTerm);
  }, [filter, searchTerm, orders]);

  const handleApprovalSubmit = async () => {
    if (!selectedOrder || !approvalAction) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      if (!token) throw new Error('No token');

      const response = await fetch(`${BASE_API}/api/checkout/${selectedOrder._id}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: approvalAction, remarks: remarks || undefined }),
      });

      if (!response.ok) throw new Error('Failed to update');

      alert(`Order ${approvalAction === 'APPROVE' ? 'approved' : 'rejected'} successfully!`);
      await fetchOrders();
      setShowApprovalModal(false);
      setSelectedOrder(null);
      setApprovalAction(null);
      setRemarks('');
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isApprover) return <div className="p-4 text-center text-red-600">Access Denied</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Order Approvals</h1>
        <p className="text-sm text-gray-600">Review and approve/reject pending orders</p>
      </div>

      {/* Stats Cards - Single Line */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3 shadow-sm">
          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <i className="ri-time-line text-xl text-yellow-600"></i>
          </div>
          <div>
            <p className="text-sm text-gray-600">Pending Approval</p>
            <p className="text-2xl font-bold text-gray-900">{stats.pendingCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3 shadow-sm">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <i className="ri-check-line text-xl text-green-600"></i>
          </div>
          <div>
            <p className="text-sm text-gray-600">Approved</p>
            <p className="text-2xl font-bold text-gray-900">{stats.approvedCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3 shadow-sm">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
            <i className="ri-close-line text-xl text-red-600"></i>
          </div>
          <div>
            <p className="text-sm text-gray-600">Disapproved</p>
            <p className="text-2xl font-bold text-gray-900">{stats.disapprovedCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3 shadow-sm">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <i className="ri-file-list-3-line text-xl text-blue-600"></i>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
          </div>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by Order ID, Name, Email..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <i className="ri-search-line absolute left-3 top-3 text-gray-400"></i>
          </div>
        </div>
        <select
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
        >
          <option value="all">All Orders</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="disapproved">Disapproved</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Approval</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10">
                    <div className="spinner-border text-blue-600" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{order.orderId}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{order.customer.username}</p>
                        <p className="text-sm text-gray-500">{order.customer.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {order.items.length} item(s)
                      <br />
                      <span className="text-gray-600">
                        {order.items.slice(0, 2).map(i => i.product.name).join(', ')}
                        {order.items.length > 2 && '...'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      ${order.grandTotal.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        order.orderStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        order.approvalStatus === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : order.approvalStatus === 'APPROVED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {order.approvalStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowApprovalModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        <i className="ri-eye-line mr-1"></i> View
                      </button>
                      {order.approvalStatus === 'PENDING' && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setApprovalAction('APPROVE');
                              setShowApprovalModal(true);
                            }}
                            className="ml-3 text-green-600 hover:text-green-800 text-sm font-medium"
                          >
                            <i className="ri-check-line mr-1"></i> Approve
                          </button>
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setApprovalAction('DISAPPROVE');
                              setShowApprovalModal(true);
                            }}
                            className="ml-3 text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            <i className="ri-close-line mr-1"></i> Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showApprovalModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">
                  {approvalAction ? (approvalAction === 'APPROVE' ? 'Approve' : 'Reject') : 'View'} Order
                  <span className="text-blue-600 ml-2">#{selectedOrder.orderId}</span>
                </h3>
                <button
                  onClick={() => {
                    setShowApprovalModal(false);
                    setApprovalAction(null);
                    setRemarks('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Items */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  <i className="ri-boxing-line mr-2 text-blue-600"></i> Order Items
                </h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium">Product</th>
                        <th className="px-4 py-2 text-center text-sm font-medium">Qty</th>
                        <th className="px-4 py-2 text-right text-sm font-medium">Price</th>
                        <th className="px-4 py-2 text-right text-sm font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {selectedOrder.items.map((item, i) => (
                        <tr key={i}>
                          <td className="px-4 py-2">{item.product.name}</td>
                          <td className="px-4 py-2 text-center">{item.quantity}</td>
                          <td className="px-4 py-2 text-right">${item.price.toLocaleString()}</td>
                          <td className="px-4 py-2 text-right font-medium">
                            ${(item.quantity * item.price).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 font-bold">
                        <td colSpan={3} className="px-4 py-2 text-right">Grand Total:</td>
                        <td className="px-4 py-2 text-right">${selectedOrder.grandTotal.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Customer & Store */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <i className="ri-user-line mr-2 text-green-600"></i> Customer
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Name:</strong> {selectedOrder.customer.username}</p>
                    <p><strong>Email:</strong> {selectedOrder.customer.email}</p>
                    <p><strong>Phone:</strong> {selectedOrder.customer.phone_number}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <i className="ri-store-line mr-2 text-purple-600"></i> Store
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Store:</strong> {selectedOrder.customer.warehouse?.name}</p>
                    <p><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Remarks */}
              {approvalAction && (
                <div>
                  <label className="block font-medium mb-2">
                    {approvalAction === 'APPROVE' ? 'Approval Remarks (Optional)' : 'Rejection Reason (Required)'}
                  </label>
                  <textarea
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Enter remarks..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  setApprovalAction(null);
                  setRemarks('');
                }}
                className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              {approvalAction && (
                <button
                  onClick={handleApprovalSubmit}
                  disabled={submitting || (approvalAction === 'DISAPPROVE' && !remarks.trim())}
                  className={`px-5 py-2 rounded-lg text-white font-medium ${
                    approvalAction === 'APPROVE'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  } disabled:opacity-50`}
                >
                  {submitting ? 'Processing...' : approvalAction === 'APPROVE' ? 'Approve' : 'Reject'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Approvals;