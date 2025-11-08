import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  isDangerous = false,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isLoading = false,
}) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onCancel} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-sm w-full">
          <div className="p-6">
            <div
              className={`flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-4 ${
                isDangerous ? 'bg-red-100' : 'bg-blue-100'
              }`}
            >
              <AlertTriangle
                className={`w-6 h-6 ${isDangerous ? 'text-red-600' : 'text-blue-600'}`}
              />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">{title}</h3>
            <p className="text-gray-600 text-center mb-6">{message}</p>
          </div>
          <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${
                isDangerous ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? 'Loading...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
