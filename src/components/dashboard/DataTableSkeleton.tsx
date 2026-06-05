import React from 'react';
import { Search, Eye, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

const DUMMY_DATA = [
  { id: '#SRV-00128', client: 'Alexandra Deff', service: 'Website Maintenance', date: 'Nov 30, 2024', status: 'Completed', amount: '$450.00' },
  { id: '#SRV-00127', client: 'Edwin Adenike', service: 'API Integration', date: 'Nov 29, 2024', status: 'In Progress', amount: '$750.00' },
  { id: '#SRV-00126', client: 'Isaac Oluwatemil...', service: 'Bug Fixing', date: 'Nov 28, 2024', status: 'Completed', amount: '$300.00' },
  { id: '#SRV-00125', client: 'David Oshodi', service: 'UI/UX Design', date: 'Nov 27, 2024', status: 'Completed', amount: '$600.00' },
  { id: '#SRV-00124', client: 'Sophia Bennett', service: 'Performance Opt.', date: 'Nov 26, 2024', status: 'In Progress', amount: '$500.00' },
  { id: '#SRV-00123', client: 'Liam Johnson', service: 'Security Audit', date: 'Nov 25, 2024', status: 'Completed', amount: '$800.00' },
  { id: '#SRV-00122', client: 'Olivia Martinez', service: 'Database Setup', date: 'Nov 24, 2024', status: 'Cancelled', amount: '$350.00' },
  { id: '#SRV-00121', client: 'Noah Williams', service: 'Cloud Migration', date: 'Nov 23, 2024', status: 'Completed', amount: '$1,200.00' },
];

export default function DataTableSkeleton() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-[#DCFCE7] text-[#16A34A]';
      case 'In Progress': return 'bg-[#FEF3C7] text-[#D97706]';
      case 'Cancelled': return 'bg-[#FEE2E2] text-[#EF4444]';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-[24px] border border-[#E2E8F0] shadow-sm flex flex-col min-h-[700px]">
      {/* Table Header Controls */}
      <div className="p-6 border-b border-[#E2E8F0] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex gap-6 border-b border-[#E2E8F0] w-full max-w-full md:max-w-[400px] overflow-x-auto scrollbar-hide">
          <button className="pb-4 text-sm font-semibold text-[#16A34A] border-b-2 border-[#16A34A]">All Services</button>
          <button className="pb-4 text-sm font-medium text-[#64748B] hover:text-[#0F172A] transition-colors">Completed</button>
          <button className="pb-4 text-sm font-medium text-[#64748B] hover:text-[#0F172A] transition-colors">In Progress</button>
          <button className="pb-4 text-sm font-medium text-[#64748B] hover:text-[#0F172A] transition-colors">Cancelled</button>
        </div>
        
        <div className="relative w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search services..."
            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A] transition-all"
          />
        </div>
      </div>

      {/* Table Area */}
      <div className="flex-1 p-6 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E2E8F0]">
              <th className="pb-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Service ID</th>
              <th className="pb-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Client</th>
              <th className="pb-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Service</th>
              <th className="pb-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Date</th>
              <th className="pb-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Status</th>
              <th className="pb-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider">Amount</th>
              <th className="pb-4 text-xs font-semibold text-[#64748B] uppercase tracking-wider text-center">Action</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {DUMMY_DATA.map((row, idx) => (
              <tr key={idx} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors group">
                <td className="py-4 font-medium text-[#64748B]">{row.id}</td>
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#E2E8F0] flex items-center justify-center text-lg shrink-0">
                      🧑🏽‍🦱
                    </div>
                    <span className="font-semibold text-[#0F172A]">{row.client}</span>
                  </div>
                </td>
                <td className="py-4 text-[#0F172A]">{row.service}</td>
                <td className="py-4 text-[#64748B]">{row.date}</td>
                <td className="py-4">
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-md ${getStatusBadge(row.status)}`}>
                    {row.status}
                  </span>
                </td>
                <td className="py-4 text-[#0F172A] font-medium">{row.amount}</td>
                <td className="py-4 text-center">
                  <button className="p-2 text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#E2E8F0] rounded-lg transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-6 border-t border-[#E2E8F0] flex items-center justify-between">
        <p className="text-sm text-[#64748B]">Showing 1 to 8 of 128 results</p>
        <div className="flex items-center gap-1">
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC] transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#16A34A] text-white font-medium text-sm shadow-sm shadow-green-600/20">1</button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-transparent text-[#64748B] hover:bg-[#F8FAFC] font-medium text-sm transition-colors">2</button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-transparent text-[#64748B] hover:bg-[#F8FAFC] font-medium text-sm transition-colors">3</button>
          <span className="w-8 h-8 flex items-center justify-center text-[#94A3B8]">...</span>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-transparent text-[#64748B] hover:bg-[#F8FAFC] font-medium text-sm transition-colors">16</button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E2E8F0] text-[#0F172A] hover:bg-[#F8FAFC] transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
