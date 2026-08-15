'use client'

import { X } from 'lucide-react'
import { useEffect } from 'react'

export function Modal({
  title,
  eyebrow,
  onClose,
  children,
  footer,
}: Readonly<{
  title: string
  eyebrow?: string
  onClose: () => void
  children: React.ReactNode
  footer?: React.ReactNode
}>) {
  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <button
        type="button"
        className="fixed inset-0 bg-black/60 border-0 cursor-pointer"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative w-full max-w-[640px] max-h-[85vh] overflow-y-auto border border-surface-line bg-surface-panel rounded-lg shadow-[0_20px_60px_#0008] p-[22px]"
      >
        <div className="flex items-start justify-between gap-[15px]">
          <div>
            {eyebrow && (
              <p className="text-teal-700 dark:text-[#8fa29f] tracking-[1.25px] font-bold text-[10px] m-[0_0_8px] uppercase">
                {eyebrow}
              </p>
            )}
            <h2 id="modal-title" className="m-0 text-[18px]">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="border-0 bg-transparent text-content-muted hover:text-content-base p-1 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-teal shrink-0"
          >
            <X size={18} />
          </button>
        </div>
        <div className="mt-[18px]">{children}</div>
        {footer && (
          <div className="mt-[20px] pt-[16px] border-t border-surface-line flex justify-end gap-[10px]">{footer}</div>
        )}
      </div>
    </div>
  )
}
