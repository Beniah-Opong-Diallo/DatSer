import React from 'react'
import { X, Download, UserPlus, FileText, Smartphone, CheckCircle2 } from 'lucide-react'

const ExportContactsModal = ({ isOpen, onClose, onExportCSV, onExportVCard, contactCount }) => {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300" 
                onClick={onClose} 
            />

            {/* Modal */}
            <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-800">
                {/* Header */}
                <div className="p-6 pb-4 flex flex-col items-center text-center">
                    <div className="h-16 w-16 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-4">
                        <UserPlus className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Export Contacts</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        How would you like to save these <span className="font-semibold text-orange-600 dark:text-orange-400">{contactCount}</span> contacts?
                    </p>
                </div>

                {/* Content */}
                <div className="px-6 py-2 space-y-3">
                    <button
                        onClick={() => {
                            onExportVCard()
                            onClose()
                        }}
                        className="w-full group flex items-center gap-4 p-4 rounded-2xl border-2 border-orange-100 dark:border-orange-900/20 bg-orange-50/50 dark:bg-orange-900/10 hover:border-orange-500 dark:hover:border-orange-500 transition-all text-left"
                    >
                        <div className="h-12 w-12 shrink-0 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-200 dark:shadow-none">
                            <Smartphone className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-gray-900 dark:text-white">Add to Phone</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Directly import into your iPhone or Android contacts</p>
                        </div>
                    </button>

                    <button
                        onClick={() => {
                            onExportCSV()
                            onClose()
                        }}
                        className="w-full group flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 hover:border-gray-300 dark:hover:border-gray-600 transition-all text-left"
                    >
                        <div className="h-12 w-12 shrink-0 rounded-xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-gray-900 dark:text-white">Download CSV</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Save as a spreadsheet file for Excel or backup</p>
                        </div>
                    </button>
                </div>

                {/* Footer */}
                <div className="p-6">
                    <button
                        onClick={onClose}
                        className="w-full py-3 rounded-2xl text-sm font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ExportContactsModal
