"use client";

import React, { useState, useRef } from 'react';
import { Upload, X, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import api from '@/utils/axiosInstance';

interface BulkImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function BulkImportModal({ isOpen, onClose, onSuccess }: BulkImportModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState<{ total: number; current: number } | null>(null);
    const [results, setResults] = useState<{ success: number; failed: number; errors: any[] } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setError(null);
            setResults(null);
        }
    };

    const processExcelDate = (excelDate: any) => {
        if (!excelDate) return null;
        if (typeof excelDate === 'number') {
            const date = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
            return isNaN(date.getTime()) ? null : date.toISOString();
        }
        if (typeof excelDate === 'string') {
            const date = new Date(excelDate);
            return isNaN(date.getTime()) ? null : date.toISOString();
        }
        return null;
    };

    const handleUpload = async () => {
        if (!file) {
            setError("Please select a file first.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const buffer = await file.arrayBuffer();
            const workbook = XLSX.read(buffer, { type: 'array' });
            
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            if (jsonData.length === 0) {
                throw new Error("The Excel file is empty.");
            }

            // Map Excel columns to API payload
            const tickets = jsonData.map((row: any) => ({
                fsp_center: row['FSP Center'] || row['FSPCenter'],
                fsp_region: row['FSP Region'] || row['FSPRegion'],
                fsp_subregion: row['FSP SubRegion'] || row['FSPSubRegion'],
                call_type: row['Call Type'] || row['CallType'],
                call_ticket_no: row['Call Ticket No'] || row['CallTicketNo'],
                request_date: processExcelDate(row['Request Date'] || row['RequestDate']),
                merchant_name: row['Merchant Name'] || row['MerchantName'] || row['Contactname'] || row['Contact Name'],
                mid: row['MID'],
                tid: row['TID'],
                bank: row['Bank'],
                location: row['Location'],
                city: row['City'],
                state_code: row['StateCode'] || row['State Code'],
                mcc_code: row['MCCCode'] || row['MCC Code'],
                zone_name: row['Zone Name'] || row['ZoneName'],
                ticket_branch_code: row['BranchCode'] || row['Branch Code'],
                ticket_branch_name: row['BranchName'] || row['Branch Name'],
                branch_manager: row['BranchManager'] || row['Branch Manager'],
                branch_manager_mobile: row['Branch Manager Mobile NO'] || row['BranchManagerMobileNO'],
                sponsor_bank: row['SponsorBank - Payment'] || row['SponsorBank'] || row['Bank'],
                merchant_address: row['Contactaddress'] || row['Contact Address'] || row['Location'],
                merchant_pincode: row['ContactZip'] || row['Contact Zip'],
                contact_name: row['Contactname'] || row['Contact Name'],
                telephone_no: row['TelephoneNo'] || row['Telephone No'],
                merchant_mobile: row['MobileNo'] || row['Mobile No'] || row['Mobile NO']
            }));

            // Validate mandatory fields broadly
            const missingMobile = tickets.filter(t => !t.merchant_mobile);
            if (missingMobile.length > 0) {
                console.warn(`Found ${missingMobile.length} rows without a MobileNo. They might fail to map to a merchant.`);
            }

            setProgress({ total: tickets.length, current: 0 });

            // Send to backend in one bulk request
            const response = await api.post('/tickets/bulk', { tickets });
            
            if (response.data.success) {
                setResults({
                    success: response.data.data.successCount,
                    failed: response.data.data.errorCount,
                    errors: response.data.data.errors
                });
                onSuccess();
            } else {
                throw new Error(response.data.message || "Failed to import tickets");
            }

        } catch (err: any) {
            setError(err.message || "An unexpected error occurred during import.");
        } finally {
            setLoading(false);
            setProgress(null);
        }
    };

    const reset = () => {
        setFile(null);
        setError(null);
        setResults(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Bulk Import Tickets</h2>
                        <p className="text-sm text-slate-500 mt-1">Upload an Excel (.xlsx) file to create multiple tickets</p>
                    </div>
                    <button 
                        onClick={() => { reset(); onClose(); }}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    {results ? (
                        <div className="space-y-6">
                            <div className="flex items-center justify-center p-6 bg-emerald-50 rounded-xl border border-emerald-100">
                                <div className="text-center">
                                    <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                                    <h3 className="text-lg font-semibold text-emerald-900">Import Complete</h3>
                                    <p className="text-emerald-700 mt-1">
                                        Successfully imported {results.success} tickets.
                                    </p>
                                </div>
                            </div>
                            
                            {results.failed > 0 && (
                                <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                                    <div className="flex items-center gap-2 text-red-700 font-medium mb-3">
                                        <AlertCircle className="w-5 h-5" />
                                        <span>{results.failed} tickets failed to import:</span>
                                    </div>
                                    <div className="max-h-40 overflow-y-auto space-y-2 text-sm text-red-600">
                                        {results.errors.map((err, i) => (
                                            <div key={i} className="flex gap-2">
                                                <span className="font-semibold min-w-[60px]">Row {err.row}:</span>
                                                <span>{err.message}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={() => { reset(); onClose(); }}
                                className="w-full py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors font-medium"
                            >
                                Close
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {error && (
                                <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex gap-3 text-sm">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    <p>{error}</p>
                                </div>
                            )}

                            <div 
                                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                                    file ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept=".xlsx, .xls"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                {file ? (
                                    <div>
                                        <FileSpreadsheet className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                                        <p className="font-medium text-emerald-900">{file.name}</p>
                                        <p className="text-sm text-emerald-600 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); reset(); }}
                                            className="text-sm text-emerald-700 hover:text-emerald-800 mt-4 underline"
                                        >
                                            Remove file
                                        </button>
                                    </div>
                                ) : (
                                    <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer">
                                        <Upload className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                        <p className="font-medium text-slate-700">Click to upload Excel file</p>
                                        <p className="text-sm text-slate-500 mt-1">.xlsx or .xls up to 5MB</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => { reset(); onClose(); }}
                                    className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors font-medium"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpload}
                                    disabled={!file || loading}
                                    className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-5 h-5" />
                                            <span>Import Tickets</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
