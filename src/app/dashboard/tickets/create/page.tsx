"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, Building, Smartphone, HardDrive, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import api from '@/utils/axiosInstance';

export default function CreateTicketPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [machineSearchQuery, setMachineSearchQuery] = useState('');
    const [machineOptions, setMachineOptions] = useState<any[]>([]);
    const [showMachineDropdown, setShowMachineDropdown] = useState(false);

    const [formData, setFormData] = useState({
        service_type: 'INSTALLATION',
        priority: 'NORMAL',
        source: 'OPERATOR_RAISED',
        merchant_name: '',
        business_name: '',
        merchant_mobile: '',
        merchant_email: '',
        merchant_address: '',
        merchant_pincode: '',
        machine_id: '',
        complaint_category: '',
        complaint_description: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError(null);
    };

    const handleMachineSearch = async (query: string) => {
        setMachineSearchQuery(query);
        setFormData(prev => ({ ...prev, machine_id: query })); // accept custom typed text as ID
        
        try {
            const url = query 
                ? `/machines?search=${encodeURIComponent(query)}&limit=10`
                : `/machines?status=DEPLOYED&limit=20`;
            const { data } = await api.get(url);
            const machines = Array.isArray(data.machines) ? data.machines : (Array.isArray(data.data) ? data.data : (data.data?.machines || []));
            setMachineOptions(machines);
            setShowMachineDropdown(true);
        } catch (err) {
            console.error('Failed to fetch machines', err);
        }
    };

    const selectMachine = (m: any) => {
        setMachineSearchQuery(m.serial_number);
        setFormData(prev => ({ ...prev, machine_id: m.id }));
        setShowMachineDropdown(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const payload = { ...formData };
            if (!payload.machine_id) delete (payload as any).machine_id;
            if (!payload.business_name) delete (payload as any).business_name;
            if (!payload.merchant_email) delete (payload as any).merchant_email;
            if (!payload.complaint_category) delete (payload as any).complaint_category;

            const { data } = await api.post('/tickets', payload);
            if (data?.success) {
                // Success Toast would go here
                router.push(`/dashboard/tickets/${data.data.id}`);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to create ticket');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 sm:p-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link 
                    href="/dashboard/tickets"
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Create New Ticket</h1>
                    <p className="text-slate-500 mt-1">Register a new service request</p>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* 1. Merchant Information */}
                <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                            <Building className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-semibold text-slate-900">Merchant Information</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Merchant Name *</label>
                            <input 
                                type="text" name="merchant_name" required value={formData.merchant_name} onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Business Name</label>
                            <input 
                                type="text" name="business_name" value={formData.business_name} onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Mobile Number *</label>
                            <input 
                                type="text" name="merchant_mobile" required maxLength={10} minLength={10} pattern="\d{10}" value={formData.merchant_mobile} onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                            <input 
                                type="email" name="merchant_email" value={formData.merchant_email} onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Address *</label>
                            <input 
                                type="text" name="merchant_address" required value={formData.merchant_address} onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Pincode *</label>
                            <input 
                                type="text" name="merchant_pincode" required maxLength={6} minLength={6} pattern="\d{6}" value={formData.merchant_pincode} onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Machine Information */}
                <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                            <HardDrive className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-semibold text-slate-900">Machine Information</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2 relative">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Machine ID (Optional)</label>
                            <input 
                                type="text" 
                                placeholder="Search by serial number or enter custom ID..." 
                                value={machineSearchQuery} 
                                onChange={(e) => handleMachineSearch(e.target.value)}
                                onFocus={() => { 
                                    if (!machineSearchQuery && machineOptions.length === 0) {
                                        handleMachineSearch('');
                                    } else {
                                        setShowMachineDropdown(true); 
                                    }
                                }}
                                onBlur={() => setTimeout(() => setShowMachineDropdown(false), 200)}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                            {showMachineDropdown && machineOptions.length > 0 && (
                                <ul className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                                    {machineOptions.map((m: any) => (
                                        <li 
                                            key={m.id} 
                                            onClick={() => selectMachine(m)}
                                            className="px-4 py-3 hover:bg-emerald-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                                        >
                                            <div className="font-semibold text-slate-900">{m.serial_number}</div>
                                            <div className="text-xs text-slate-500 mt-1">ID: {m.id}</div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <p className="text-xs text-slate-500 mt-2">Search suggested. Custom machine IDs are also accepted if the machine is not found.</p>
                        </div>
                    </div>
                </div>

                {/* 3. Service Information */}
                <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-semibold text-slate-900">Service Information</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Service Type *</label>
                            <select 
                                name="service_type" required value={formData.service_type} onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                            >
                                <option value="INSTALLATION">Installation</option>
                                <option value="DEINSTALLATION">Deinstallation</option>
                                <option value="REPLACEMENT">Replacement</option>
                                <option value="MISC_SERV">Miscellaneous Service</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Priority *</label>
                            <select 
                                name="priority" required value={formData.priority} onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                            >
                                <option value="NORMAL">Normal</option>
                                <option value="URGENT">Urgent</option>
                                <option value="CRITICAL">Critical</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Source *</label>
                            <select 
                                name="source" required value={formData.source} onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                            >
                                <option value="CUSTOMER_PORTAL">Customer Portal</option>
                                <option value="OPERATOR_RAISED">Operator Raised</option>
                                <option value="BANK_TRIGGERED">Bank Triggered</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Complaint Category</label>
                            <input 
                                type="text" name="complaint_category" value={formData.complaint_category} onChange={handleChange} placeholder="e.g. Printer Issue"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Complaint Description</label>
                        <textarea 
                            name="complaint_description" rows={4} value={formData.complaint_description} onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                        ></textarea>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors shadow-sm disabled:opacity-70"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        {loading ? 'Creating...' : 'Create Ticket'}
                    </button>
                </div>
            </form>
        </div>
    );
}
