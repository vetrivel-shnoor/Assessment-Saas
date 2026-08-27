import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Simple Close Icon (Or import from lucide-react/heroicons)
const CloseIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const Modal = ({ isOpen, onClose, title, description, children, theme }) => {
  // 1. Handle Back Button & Escape Key Logic
  useEffect(() => {
    if (isOpen) {
      // Add state to history so back button closes modal
      window.history.pushState({ modalOpen: true }, "", window.location.href);

      const handlePopState = () => onClose();
      const handleKeyDown = (e) => {
        if (e.key === "Escape") onClose();
      };

      window.addEventListener("popstate", handlePopState);
      window.addEventListener("keydown", handleKeyDown);

      return () => {
        window.removeEventListener("popstate", handlePopState);
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  // Ensure we don't render anything if not open (unless handling exit anims in parent)
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] backdrop-blur-sm bg-black/50 flex items-center justify-center p-4"
          onClick={onClose} // Close when clicking overlay
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()} // Prevent close when clicking content
            className="w-full max-w-lg border rounded-3xl overflow-hidden relative flex flex-col max-h-[90vh] bg-white dark:bg-[#18181b] border-gray-200 dark:border-gray-800 shadow-xl text-gray-900 dark:text-gray-100"
          >
            {/* Header Section */}
            <div className="p-6 pb-2">
              <div className="flex justify-between items-start mb-2">
                <h2
                  className="text-2xl font-bold leading-tight pr-8 text-gray-900 dark:text-white"
                >
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 absolute top-5 right-5"
                >
                  <CloseIcon />
                </button>
              </div>

              {description && (
                <p
                  className="text-sm leading-relaxed text-gray-500 dark:text-gray-400"
                >
                  {description}
                </p>
              )}
            </div>

            {/* Content / Buttons Section */}
            <div className="p-6 pt-4 overflow-y-auto">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
