import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

export default function ConfirmDialog({
  isOpen, onClose, onConfirm,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Delete',
  variant = 'danger',
  loading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="p-7 text-center">
        {/* Icon */}
        <div className="mx-auto mb-5 relative" style={{ width: 64, height: 64 }}>
          <div
            className="absolute inset-0 rounded-2xl animate-pulse-slow"
            style={{
              background: variant === 'danger'
                ? 'rgba(255,59,48,0.10)'
                : 'rgba(255,159,10,0.12)',
              boxShadow: variant === 'danger'
                ? '0 0 24px rgba(255,59,48,0.20)'
                : '0 0 24px rgba(255,159,10,0.18)',
            }}
          />
          <div
            className="absolute inset-1 rounded-xl flex items-center justify-center"
            style={{
              background: variant === 'danger'
                ? 'rgba(255,59,48,0.08)'
                : 'rgba(255,159,10,0.08)',
              border: `1px solid ${variant === 'danger' ? 'rgba(255,59,48,0.22)' : 'rgba(255,159,10,0.22)'}`,
            }}
          >
            <AlertTriangle
              size={24}
              style={{ color: variant === 'danger' ? 'rgba(255,59,48,0.85)' : 'rgba(255,159,10,0.88)' }}
            />
          </div>
        </div>

        <h3
          className="text-base font-semibold mb-2"
          style={{ color: 'rgba(0,0,0,0.84)', letterSpacing: '-0.01em' }}
        >
          {title}
        </h3>
        {message && (
          <p className="text-sm mb-6" style={{ color: 'rgba(0,0,0,0.45)' }}>{message}</p>
        )}

        <div className="flex gap-3">
          <motion.button
            onClick={onClose}
            className="btn-outline flex-1"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Cancel
          </motion.button>
          <motion.button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 btn ${variant === 'danger' ? 'btn-danger' : 'btn-primary'}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? 'Processing…' : confirmLabel}
          </motion.button>
        </div>
      </div>
    </Modal>
  );
}
