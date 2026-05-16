import React, { useState } from 'react'
import { 
    X, 
    Download, 
    UserPlus, 
    FileText, 
    Smartphone, 
    CheckCircle2, 
    Info, 
    ChevronRight,
    ArrowDownToLine,
    Contact,
    Apple,
    Smartphone as AndroidIcon
} from 'lucide-react'
import useHapticFeedback from '../hooks/useHapticFeedback'
import useBottomSheetDrag from '../hooks/useBottomSheetDrag'

const ExportContactsModal = ({ isOpen, onClose, onExportCSV, onExportVCard, contactCount }) => {
    const [activeTab, setActiveTab] = useState('options') // 'options' or 'help'
    const { selection } = useHapticFeedback()
    const { dragHandleProps, sheetStyle } = useBottomSheetDrag({
        onDismiss: onClose
    })

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop with enhanced blur */}
            <div 
                className="absolute inset-0 bg-gray-900/40 backdrop-blur-md animate-in fade-in duration-500" 
                onClick={onClose} 
            />

            {/* Modal Container */}
            <div 
                className="relative w-full max-w-[420px] bg-white dark:bg-gray-950 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 border border-gray-100 dark:border-gray-800 flex flex-col"
                style={sheetStyle}
            >
                {/* Drag Handle Zone (Mobile Only) */}
                <div 
                    className="sm:hidden w-full flex justify-center py-3 cursor-grab active:cursor-grabbing flex-none"
                    {...dragHandleProps}
                >
                    <div className="w-12 h-1.5 rounded-full bg-gray-200 dark:bg-gray-800" />
                </div>
                
                {/* Header Section */}
                <div className="relative p-6 pt-2 pb-2 text-center overflow-hidden">
                    {/* Background Glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-orange-500/10 blur-[60px] rounded-full pointer-events-none" />
                    
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-all active:scale-90"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="relative inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-orange-100 dark:bg-orange-900/30 mb-5 group">
                        <Contact className="w-10 h-10 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform duration-300" />
                        <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-white dark:bg-gray-900 border-2 border-orange-50 dark:border-gray-800 flex items-center justify-center shadow-sm">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                        </div>
                    </div>

                    <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Export Contacts</h2>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-2 uppercase tracking-widest">
                        <span className="text-orange-600">{contactCount}</span> Members Found
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="flex px-6 mt-4 gap-1">
                    <button 
                        onClick={() => setActiveTab('options')}
                        className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${activeTab === 'options' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900'}`}
                    >
                        Export Options
                    </button>
                    <button 
                        onClick={() => setActiveTab('help')}
                        className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${activeTab === 'help' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900'}`}
                    >
                        Mobile Guide
                    </button>
                </div>

                {/* Content Area */}
                <div className="p-6">
                    {activeTab === 'options' ? (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            {/* VCF Option */}
                            <button
                                onClick={() => {
                                    onExportVCard()
                                    onClose()
                                }}
                                className="w-full group flex items-start gap-4 p-5 rounded-xl border border-orange-100 dark:border-orange-900/20 bg-orange-50/20 dark:bg-orange-900/5 hover:border-orange-500 dark:hover:border-orange-500 hover:bg-white dark:hover:bg-gray-900 transition-all text-left shadow-sm hover:shadow-xl hover:shadow-orange-500/10"
                            >
                                <div className="h-12 w-12 shrink-0 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-600/20 group-hover:scale-110 transition-transform">
                                    <Smartphone className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-black text-gray-900 dark:text-white text-base">Save to Phone Contacts</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">Imports directly into your phone. Best for WhatsApp and calling.</p>
                                    <div className="mt-3 flex items-center gap-1 text-[9px] font-black uppercase text-orange-600">
                                        <span>Recommended for Mobile</span>
                                        <ChevronRight className="w-3 h-3" />
                                    </div>
                                </div>
                            </button>

                            {/* CSV Option */}
                            <button
                                onClick={() => {
                                    onExportCSV()
                                    onClose()
                                }}
                                className="w-full group flex items-start gap-4 p-5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 hover:border-gray-300 dark:hover:border-gray-700 hover:bg-white dark:hover:bg-gray-900 transition-all text-left"
                            >
                                <div className="h-12 w-12 shrink-0 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-black text-gray-900 dark:text-white text-base">Download Spreadsheet</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">Save as .CSV file for Excel or Google Sheets backups.</p>
                                </div>
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-5 border border-gray-100 dark:border-gray-800">
                                <h3 className="flex items-center gap-2 text-xs font-black uppercase text-gray-900 dark:text-white mb-4">
                                    <Apple className="w-4 h-4" /> iPhone Instructions
                                </h3>
                                <ul className="space-y-3 text-[11px] text-gray-600 dark:text-gray-400 font-medium">
                                    <li className="flex gap-3">
                                        <span className="flex-none h-5 w-5 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px] font-bold">1</span>
                                        <span>Tap <b>"Save to Phone"</b> and open the downloaded file.</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="flex-none h-5 w-5 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px] font-bold">2</span>
                                        <span>Scroll to the bottom and tap <b>"Add All Contacts"</b>.</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="flex-none h-5 w-5 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px] font-bold">3</span>
                                        <span>Confirm <b>"Create New Contacts"</b> to finish.</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-5 border border-gray-100 dark:border-gray-800">
                                <h3 className="flex items-center gap-2 text-xs font-black uppercase text-gray-900 dark:text-white mb-4">
                                    <AndroidIcon className="w-4 h-4" /> Android Instructions
                                </h3>
                                <ul className="space-y-3 text-[11px] text-gray-600 dark:text-gray-400 font-medium">
                                    <li className="flex gap-3">
                                        <span className="flex-none h-5 w-5 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px] font-bold">1</span>
                                        <span>Tap <b>"Save to Phone"</b> and open the file.</span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="flex-none h-5 w-5 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px] font-bold">2</span>
                                        <span>Select <b>"Phone"</b> or <b>"Google"</b> as the save location.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Action */}
                <div className="p-6 pt-2 bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800">
                    <button
                        onClick={onClose}
                        className="w-full py-4 rounded-xl text-xs font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        Dismiss
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ExportContactsModal
