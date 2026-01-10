import React from 'react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'

const DebugPanel = () => {
    const {
        isCollaborator,
        dataOwnerId,
        monthlyTables,
        currentTable,
        user
    } = useApp()

    const { user: authUser } = useAuth()

    return (
        <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs font-mono max-w-md z-[9999] shadow-2xl border border-yellow-400">
            <div className="font-bold text-yellow-400 mb-2">🐛 DEBUG INFO</div>

            <div className="space-y-1">
                <div>
                    <span className="text-gray-400">User Email:</span> {authUser?.email || user?.email || 'N/A'}
                </div>
                <div>
                    <span className="text-gray-400">User ID:</span> {authUser?.id || user?.id || 'N/A'}
                </div>
                <div>
                    <span className={isCollaborator ? "text-green-400" : "text-red-400"}>
                        Is Collaborator:
                    </span> {isCollaborator ? 'YES ✅' : 'NO ❌'}
                </div>
                <div>
                    <span className="text-gray-400">Data Owner ID:</span> {dataOwnerId || 'N/A'}
                </div>
                <div>
                    <span className="text-gray-400">Current Table:</span> {currentTable || 'N/A'}
                </div>
                <div>
                    <span className="text-gray-400">Monthly Tables Count:</span> {monthlyTables?.length || 0}
                </div>
                {monthlyTables && monthlyTables.length > 0 && (
                    <div className="mt-2 p-2 bg-gray-800 rounded max-h-32 overflow-y-auto">
                        <div className="text-gray-400 mb-1">Available Months:</div>
                        {monthlyTables.map((table, i) => (
                            <div key={i} className="text-green-400">• {table}</div>
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-2 pt-2 border-t border-gray-700 text-[10px] text-gray-500">
                Press F12 to see detailed console logs
            </div>
        </div>
    )
}

export default DebugPanel
