'use client';
import React, { useEffect, useState } from 'react';
import { useUserDataQuery } from '@/framework/basic-rest/user-data/use-user-data';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import {
  CheckCircle,
  Eye,
  XCircle,
  Package,
  Store,
  User,
  DollarSign,
} from 'lucide-react';
import Image from 'next/image';

interface B2BPurchaseRequest {
  _id: string;
  vendorProductId: {
    _id: string;
    vendorModel: string;
    title: string;
    brand?: string;
    category?: string;
  };
  skuId: {
    _id: string;
    sku: string;
    price: number;
    currency: string;
    metalColor?: string;
    metalType?: string;
    size?: string;
    attributes: {
      descriptionname: string;
      avgweight: string;
      modelno: string;
      style: string;
      year: string;
      centercarat: string;
      centerclarity: string;
      centercolor: string;
      centerstone: string;
      sidestone: string;
      stonetype: string;
      centershape: string;
      sideclarity: string;
      sideshape: string;
      sidecarat: string;
    };
    images: string[];
  };
  quantity: number;
  storeWarehouseId: {
    _id: string;
    name: string;
    isMain?: boolean;
  };
  status:
    | 'PENDING_DM'
    | 'PENDING_CM'
    | 'PENDING_ADMIN'
    | 'APPROVED'
    | 'REJECTED';
  requestedBy: string;
  requestedByModel: 'Customer' | 'User';
  requestedByUser?: {
    username: string;
    email: string;
    phone_number?: string;
  };
  approvals: {
    dm?: { userId: string; approvedAt: string };
    cm?: { userId: string; approvedAt: string };
    admin?: { userId: string; approvedAt: string };
  };
  rejection?: {
    rejectedBy: string;
    rejectedAt: string;
    reason: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface B2BApprovalStats {
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  totalCount: number;
}

const B2BApprovalsV2 = ({ lang }: { lang: string }) => {
  const [requests, setRequests] = useState<B2BPurchaseRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<
    B2BPurchaseRequest[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<B2BApprovalStats>({
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    totalCount: 0,
  });
  const [filter, setFilter] = useState<
    'pending' | 'approved' | 'rejected' | 'all'
  >('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] =
    useState<B2BPurchaseRequest | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState<
    'APPROVE' | 'REJECT' | null
  >(null);
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data: user, isLoading: userLoading } = useUserDataQuery();
  const router = useRouter();

  const BASE_API = process.env.NEXT_PUBLIC_BASE_API || 'http://localhost:5000';

  const userRole = user?.role?.role_name || 'User';
  const isDM = userRole?.toLowerCase() === 'district manager';
  const isCM = userRole?.toLowerCase() === 'corporate manager';
  const isApprover = isDM || isCM;

  useEffect(() => {
    if (!userLoading && !isApprover) {
      router.push(`/${lang}/profile-details?option=Personal Info`);
    }
  }, [isApprover, router, lang, userLoading]);

  const fetchRequests = async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const token =
        localStorage?.getItem('auth_token') || localStorage?.getItem('token');
      if (!token) throw new Error('No token found');

      const response = await fetch(`${BASE_API}/api/v2/b2b/requests?view=approvals`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response?.ok) throw new Error('Failed to fetch B2B requests');

      const result = await response?.json();
      const requestsData = result?.data || [];

      setRequests(requestsData);
      calculateStats(requestsData);
      applyFilters(requestsData, filter, searchTerm);
    } catch (error: any) {
      const message = error?.message || 'Something went wrong';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (list: B2BPurchaseRequest[]) => {
    const pending = list.filter(
      (r) => r.status === 'PENDING_DM' || r.status === 'PENDING_CM',
    ).length;
    const approved = list.filter((r) => r.status === 'APPROVED').length;
    const rejected = list.filter((r) => r.status === 'REJECTED').length;

    setStats({
      pendingCount: pending,
      approvedCount: approved,
      rejectedCount: rejected,
      totalCount: list.length,
    });
  };

  const applyFilters = (
    list: B2BPurchaseRequest[],
    filterType: string,
    search: string,
  ) => {
    let filtered = list;

    if (filterType !== 'all') {
      if (filterType === 'pending') {
        filtered = filtered.filter(
          (r) => r.status === 'PENDING_DM' || r.status === 'PENDING_CM',
        );
      } else if (filterType === 'approved') {
        filtered = filtered.filter((r) => r.status === 'APPROVED');
      } else if (filterType === 'rejected') {
        filtered = filtered.filter((r) => r.status === 'REJECTED');
      }
    }

    if (search) {
      const term = search?.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.vendorProductId?.title?.toLowerCase().includes(term) ||
          r.vendorProductId?.vendorModel?.toLowerCase().includes(term) ||
          r.skuId?.sku?.toLowerCase().includes(term) ||
          r.storeWarehouseId?.name?.toLowerCase().includes(term) ||
          r.requestedByUser?.username?.toLowerCase().includes(term),
      );
    }

    setFilteredRequests(filtered);
  };

  useEffect(() => {
    if (!userLoading && user?._id && isApprover) fetchRequests();
  }, [user?._id, userLoading, isApprover]);

  useEffect(() => {
    applyFilters(requests, filter, searchTerm);
  }, [filter, searchTerm, requests]);

  const handleApprovalSubmit = async () => {
    if (!selectedRequest || !approvalAction) return;
    setSubmitting(true);
    try {
      const token =
        localStorage?.getItem('auth_token') || localStorage?.getItem('token');
      if (!token) throw new Error('No token');

      const endpoint = approvalAction === 'APPROVE' ? 'approve' : 'reject';
      const method = 'POST';
      const body =
        approvalAction === 'REJECT'
          ? JSON.stringify({ reason: remarks || 'No reason provided' })
          : undefined;

      const response = await fetch(
        `${BASE_API}/api/v2/b2b/${endpoint}/${selectedRequest._id}`,
        {
          method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body,
        },
      );

      if (!response?.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update request');
      }

      toast.success(
        `Request ${approvalAction === 'APPROVE' ? 'approved' : 'rejected'} successfully!`,
      );
      await fetchRequests();
      setShowApprovalModal(false);
      setSelectedRequest(null);
      setApprovalAction(null);
      setRemarks('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to process request');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      { bg: string; text: string; label: string }
    > = {
      PENDING_DM: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        label: 'Pending DM',
      },
      PENDING_CM: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        label: 'Pending CM',
      },
      PENDING_ADMIN: {
        bg: 'bg-purple-100',
        text: 'text-purple-800',
        label: 'Pending Admin',
      },
      APPROVED: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        label: 'Approved',
      },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
    };

    const style = statusMap[status] || {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      label: status,
    };
    return (
      <span
        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${style.bg} ${style.text}`}
      >
        {style.label}
      </span>
    );
  };

  if (!isApprover)
    return <div className="p-4 text-center text-red-600">Access Denied</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          B2B Purchase Approvals (v2)
        </h1>
        <p className="text-sm text-gray-600">
          Review and approve/reject B2B purchase requests from store managers
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3 shadow-sm">
          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <Package className="text-xl text-yellow-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Pending Approval</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats?.pendingCount}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3 shadow-sm">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <CheckCircle className="text-xl text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Approved</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats?.approvedCount}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3 shadow-sm">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
            <XCircle className="text-xl text-red-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Rejected</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats?.rejectedCount}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3 shadow-sm">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Package className="text-xl text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Requests</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats?.totalCount}
            </p>
          </div>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by Product, SKU, Store, Requester..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Package
              className="absolute left-3 top-3 text-gray-400"
              size={18}
            />
          </div>
        </div>
        <select
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
        >
          <option value="all">All Requests</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  SKU Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Store
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Requester
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
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
              ) : filteredRequests?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-500">
                    No B2B purchase requests found
                  </td>
                </tr>
              ) : (
                filteredRequests?.map((request) => (
                  <tr key={request?._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {request?.vendorProductId?.title || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {request?.vendorProductId?.vendorModel || 'N/A'}
                        </p>
                        {request?.vendorProductId?.brand && (
                          <p className="text-xs text-gray-400">
                            Brand: {request?.vendorProductId?.brand}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div>
                        <p className="font-medium">
                          {request?.skuId?.sku || 'N/A'}
                        </p>
                        <p className="text-gray-600">
                          {[
                            request?.skuId?.metalColor,
                            request.skuId?.metalType,
                            request?.skuId?.size,
                          ]
                            .filter(Boolean)
                            .join(' • ')}
                        </p>
                        <p className="text-gray-900 font-semibold">
                          {request.skuId?.currency || '$'}
                          {request.skuId?.price?.toLocaleString() || '0.00'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Store className="text-gray-400" size={16} />
                        <span className="font-medium">
                          {request?.storeWarehouseId?.name || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {request?.quantity || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">
                          {request?.requestedByUser?.username || 'N/A'}
                        </p>
                        {request?.requestedByUser?.email && (
                          <p className="text-sm text-gray-500">
                            {request?.requestedByUser?.email || '-'}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(request?.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowApprovalModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          <Eye size={20} />
                        </button>
                        {(request.status === 'PENDING_DM' ||
                          request.status === 'PENDING_CM') && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                setApprovalAction('APPROVE');
                                setShowApprovalModal(true);
                              }}
                              className="text-green-600 hover:text-green-800"
                              title="Approve"
                            >
                              <CheckCircle size={20} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                setApprovalAction('REJECT');
                                setShowApprovalModal(true);
                              }}
                              className="text-red-600 hover:text-red-800"
                              title="Reject"
                            >
                              <XCircle size={20} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showApprovalModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">
                  {approvalAction
                    ? approvalAction === 'APPROVE'
                      ? 'Approve'
                      : 'Reject'
                    : 'View'}{' '}
                  B2B Purchase Request
                </h3>
                <button
                  onClick={() => {
                    setShowApprovalModal(false);
                    setApprovalAction(null);
                    setRemarks('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Product Details */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Package className="text-blue-600" size={20} />
                  Product Information
                </h4>

                <div className="border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* LEFT SIDE (TEXT - TOP + CENTER) */}
                    <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-2">
                      <p>
                        <strong>VM:</strong>{' '}
                        {selectedRequest?.vendorProductId?.vendorModel || 'N/A'}
                      </p>

                      {selectedRequest?.vendorProductId?.brand && (
                        <p>
                          <strong>Brand:</strong>{' '}
                          {selectedRequest?.vendorProductId?.brand}
                        </p>
                      )}
                    </div>

                    {/* RIGHT SIDE (IMAGE) */}
                    <div className="flex justify-center md:justify-end">
                      <Image
                        src={
                          selectedRequest?.skuId?.images?.[0] ||
                          '/placeholder.png'
                        }
                        alt={
                          selectedRequest?.skuId?.attributes?.descriptionname ||
                          'product image'
                        }
                        width={200}
                        height={200}
                        className="w-full max-w-[200px] h-auto object-contain rounded-lg transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SKU Details */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Package className="text-green-600" size={20} />
                  SKU Details
                </h4>
                <div className="border rounded-lg p-4 space-y-2">
                  {selectedRequest?.skuId?.sku && (
                    <p>
                      <strong>SKU:</strong>{' '}
                      {selectedRequest?.skuId?.sku || 'N/A'}
                    </p>
                  )}

                  {selectedRequest?.skuId?.currency && (
                    <p>
                      <strong>Price:</strong>{' '}
                      {selectedRequest?.skuId?.currency || '$'}
                      {selectedRequest.skuId?.price?.toLocaleString() || '0.00'}
                    </p>
                  )}
                  {selectedRequest?.skuId?.attributes?.descriptionname && (
                    <p>
                      <strong>Description :</strong>{' '}
                      {selectedRequest?.skuId?.attributes?.descriptionname ||
                        ''}
                    </p>
                  )}
                  {selectedRequest?.skuId?.attributes?.avgweight && (
                    <p>
                      <strong>Avg Weight :</strong>{' '}
                      {selectedRequest?.skuId?.attributes?.avgweight || ''}
                    </p>
                  )}
                  {selectedRequest?.skuId?.attributes?.centercarat && (
                    <p>
                      <strong>Center Carat :</strong>{' '}
                      {selectedRequest?.skuId?.attributes?.centercarat || ''}
                    </p>
                  )}
                  {selectedRequest?.skuId?.attributes?.centercolor && (
                    <p>
                      <strong>Center Color :</strong>{' '}
                      {selectedRequest?.skuId?.attributes?.centercolor || ''}
                    </p>
                  )}
                  {selectedRequest?.skuId?.attributes?.centerclarity && (
                    <p>
                      <strong>Center Clarity :</strong>{' '}
                      {selectedRequest?.skuId?.attributes?.centerclarity || ''}
                    </p>
                  )}
                  {selectedRequest?.skuId?.attributes?.centershape && (
                    <p>
                      <strong>Center Shape :</strong>{' '}
                      {selectedRequest?.skuId?.attributes?.centershape || ''}
                    </p>
                  )}
                  {selectedRequest?.skuId?.attributes?.sidecarat && (
                    <p>
                      <strong>Side Carat :</strong>{' '}
                      {selectedRequest?.skuId?.attributes?.sidecarat || ''}
                    </p>
                  )}
                  {selectedRequest?.skuId?.attributes?.sideclarity && (
                    <p>
                      <strong>Side Clarity :</strong>{' '}
                      {selectedRequest?.skuId?.attributes?.sideclarity || ''}
                    </p>
                  )}
                  {selectedRequest?.skuId?.attributes?.sideshape && (
                    <p>
                      <strong>Side Shape :</strong>{' '}
                      {selectedRequest?.skuId?.attributes?.sideshape || ''}
                    </p>
                  )}
                  {selectedRequest?.skuId?.attributes?.year && (
                    <p>
                      <strong>Year :</strong>{' '}
                      {selectedRequest?.skuId?.attributes?.year || ''}
                    </p>
                  )}
                  {/* {selectedRequest.skuId?.metalColor && (
                    <p>
                      <strong>Metal Color:</strong> {selectedRequest.skuId.metalColor}
                    </p>
                  )} */}
                  {selectedRequest?.skuId?.metalType && (
                    <p>
                      <strong>Metal Type:</strong>{' '}
                      {selectedRequest?.skuId?.metalType || '-'}
                    </p>
                  )}
                  {selectedRequest.skuId?.size && (
                    <p>
                      <strong>Size:</strong>{' '}
                      {selectedRequest?.skuId?.size || '-'}
                    </p>
                  )}
                </div>
              </div>

              {/* Request Details */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Store className="text-purple-600" size={20} />
                    Store Information
                  </h4>
                  <div className="border rounded-lg p-4 space-y-1 text-sm">
                    <p>
                      <strong>Store:</strong>{' '}
                      {selectedRequest?.storeWarehouseId?.name || '-'}
                    </p>
                    <p>
                      <strong>Quantity:</strong> {selectedRequest.quantity}
                    </p>
                    <p>
                      <strong>Status:</strong>{' '}
                      {getStatusBadge(selectedRequest?.status)}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <User className="text-orange-600" size={20} />
                    Requester
                  </h4>
                  <div className="border rounded-lg p-4 space-y-1 text-sm">
                    <p>
                      <strong>Name:</strong>{' '}
                      {selectedRequest?.requestedByUser?.username || '-'}
                    </p>
                    {selectedRequest?.requestedByUser?.email && (
                      <p>
                        <strong>Email:</strong>{' '}
                        {selectedRequest?.requestedByUser?.email}
                      </p>
                    )}
                    {selectedRequest?.requestedByUser?.phone_number && (
                      <p>
                        <strong>Phone:</strong>{' '}
                        {selectedRequest?.requestedByUser?.phone_number}
                      </p>
                    )}
                    <p>
                      <strong>Requested:</strong>{' '}
                      {new Date(selectedRequest?.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              {/* <div className="grid md:grid-cols-2 gap-6">
                <Image
                  src={
                    selectedRequest?.skuId?.images?.[0] || '/placeholder.png'
                  }
                  alt={
                    selectedRequest?.skuId?.attributes?.descriptionname ||
                    'product image'
                  }
                  width={120}
                  height={120}
                  className="object-contain transform scale-75 xl:scale-90 3xl:scale-100 relative z-10 transition-transform duration-500 group-hover:scale-95"
                />
              </div> */}

              {/* Approval History */}
              {(selectedRequest?.approvals?.dm ||
                selectedRequest?.approvals?.cm ||
                selectedRequest?.approvals?.admin) && (
                <div>
                  <h4 className="font-semibold mb-3">Approval History</h4>
                  <div className="border rounded-lg p-4 space-y-2">
                      <p className="text-sm">
                        <strong>DM Approved:</strong>{' '}
                    {selectedRequest?.approvals?.dm?.approvedAt ?
                        new Date(
                          selectedRequest?.approvals?.dm?.approvedAt
                        ).toLocaleString() : "pending"}
                      </p>
                      <p className="text-sm">
                        <strong>CM Approved:</strong>{' '}
                    {selectedRequest?.approvals?.cm?.approvedAt ? 
                        new Date(
                          selectedRequest?.approvals?.cm?.approvedAt,
                        ).toLocaleString() : "pending"}
                      </p>
                    
                      <p className="text-sm">
                        <strong>Admin Approved:</strong>{' '}
                    {selectedRequest.approvals?.admin?.approvedAt ?
                        new Date(
                          selectedRequest.approvals?.admin?.approvedAt,
                        ).toLocaleString() : "pending"}
                      </p>
                    
                  </div>
                </div>
              )}

              {/* Rejection Info */}
              {selectedRequest?.rejection?.rejectedAt && (
                <div>
                  <h4 className="font-semibold mb-3 text-red-600">
                    Rejection Details
                  </h4>
                  <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <p className="text-sm">
                      <strong>Rejected At:</strong>{' '}
                      {selectedRequest?.rejection?.rejectedAt ? 
                      new Date(
                        selectedRequest?.rejection?.rejectedAt,
                      ).toLocaleString() : "-"
                    }
                      </p>
                    <p className="text-sm">
                      <strong>Reason:</strong>{' '}
                      {selectedRequest?.rejection?.reason ||
                        'No reason provided'}
                    </p>
                  </div>
                </div>
              )}

              {/* Remarks */}
              {approvalAction && (
                <div>
                  <label className="block font-medium mb-2">
                    {approvalAction === 'APPROVE'
                      ? 'Approval Remarks (Optional)'
                      : 'Rejection Reason (Required)'}
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
                  disabled={
                    submitting ||
                    (approvalAction === 'REJECT' && !remarks?.trim())
                  }
                  className={`px-5 py-2 rounded-lg text-white font-medium ${
                    approvalAction === 'APPROVE'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  } disabled:opacity-50`}
                >
                  {submitting
                    ? 'Processing...'
                    : approvalAction === 'APPROVE'
                      ? 'Approve'
                      : 'Reject'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default B2BApprovalsV2;
