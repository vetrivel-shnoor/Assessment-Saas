import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Loader2,
  AlertCircle,
  Building2,
  Camera,
  X,
  Check,
} from "lucide-react";
import Cropper from "react-easy-crop";
import Modal from "../../layout/Modal";
import { updateTenantName, uploadTenantLogo } from "../../../services/api";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// --- Helper: Generate Cropped Image ---
const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = new Image();
  image.src = imageSrc;
  image.crossOrigin = "anonymous";
  await new Promise((resolve) => (image.onload = resolve));
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.95);
  });
};

// --- Crop Modal ---
const CropModal = ({ imageSrc, onCancel, onSave, theme }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      await onSave(croppedBlob);
    } catch (e) {
      console.error(e);
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-3xl overflow-hidden flex flex-col max-h-[90vh] bg-white dark:bg-[#111] border border-gray-200 dark:border-[#333] text-gray-900 dark:text-white">
        <div className="p-4 flex justify-between items-center border-b border-white/10 z-10 bg-inherit">
          <h3 className="font-bold text-lg">Edit Logo</h3>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-white/10 rounded-full"
          >
            <X size={20} />
          </button>
        </div>
        <div className="relative h-64 sm:h-80 w-full bg-black">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
            onZoomChange={setZoom}
            cropShape="rect" // Or 'round' if you prefer circular logos
            showGrid={false}
          />
        </div>
        <div className="p-6 space-y-6 bg-inherit z-10">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase opacity-50 ml-1">
              Zoom
            </label>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-current h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl font-bold uppercase text-xs hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 py-3 rounded-xl font-bold uppercase text-xs bg-white text-black hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Check size={16} />
              )}
              Save Logo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function OrgInfoTab({ theme, user, setUser }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [hasChanges, setHasChanges] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Local state for Tenant Name
  const initialName = user?.tenant?.name || user?.companyName || "";
  const [orgName, setOrgName] = useState(initialName);

  // Logo upload state
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [localLogoUrl, setLocalLogoUrl] = useState(user?.tenant?.logoUrl || null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setHasChanges(orgName !== initialName);
  }, [orgName, initialName]);

  const handleInputChange = (e) => {
    setOrgName(e.target.value);
    if (error) setError("");
  };

  const handlePreSave = (e) => {
    e.preventDefault();
    setError("");
    if (!hasChanges) return;
    if (!orgName.trim()) {
      setError("Organisation Name cannot be empty.");
      return;
    }
    setIsModalOpen(true);
  };

  const handleFinalConfirm = async () => {
    setIsLoading(true);
    try {
      const response = await updateTenantName(orgName.trim());
      if (response.success) {
        if (setUser && response.tenant) {
          setUser(prev => ({
            ...prev,
            tenant: response.tenant,
            companyName: response.tenant.name
          }));
        }
        setIsModalOpen(false);
        setIsEditing(false);
        setError("");
        window.dispatchEvent(new Event("tenant-updated"));
      } else {
        setError(response.message);
      }
    } catch (err) {
      console.error(err);
      setError("Unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleEdit = () => {
    if (isEditing) {
      setOrgName(initialName);
      setError("");
    }
    setIsEditing(!isEditing);
  };

  // --- Logo Upload Flow ---
  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      const reader = new FileReader();
      reader.addEventListener("load", () => setSelectedFile(reader.result));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSaveCrop = async (croppedBlob) => {
    const file = new File([croppedBlob], "logo.jpg", { type: "image/jpeg" });
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    
    // Optimistic update
    const previewUrl = URL.createObjectURL(file);
    setLocalLogoUrl(previewUrl);
    setImgError(false);

    try {
      setIsUploading(true);
      const res = await uploadTenantLogo(file);
      if (res.success) {
        // Wait 3s for background worker to process image
        setTimeout(() => {
          setIsUploading(false);
          // Tell layout components to refetch or we can just trigger a reload or event
          window.dispatchEvent(new Event("tenant-updated"));
        }, 3000);
      } else {
        setIsUploading(false);
        setError("Failed to upload logo.");
      }
    } catch (err) {
      setIsUploading(false);
      setError("Error uploading logo.");
    }
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http") || path.startsWith("blob:")) return path;
    return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const currentLogoSrc = getImageUrl(localLogoUrl || user?.tenant?.logoUrl);

  return (
    <div className="max-w-2xl">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold uppercase tracking-tight">
          Organisation Details
        </h2>
        <button
          onClick={toggleEdit}
          disabled={isLoading || isUploading}
          className="text-xs font-bold uppercase tracking-widest underline opacity-60 hover:opacity-100 disabled:opacity-30"
        >
          {isEditing ? "Cancel" : "Edit Details"}
        </button>
      </div>

      {/* --- LOGO SECTION --- */}
      <div className="mb-10">
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div
              className="w-24 h-24 rounded-2xl overflow-hidden border-2 flex items-center justify-center relative"
              style={{
                borderColor: theme.scrollbar?.teeth || "rgba(255,255,255,0.1)",
                backgroundColor:
                  theme.scrollbar?.handleGradientStart ||
                  (theme.bg === "#000000" ? "#18181b" : "#f3f4f6"),
              }}
            >
              {isUploading && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-gray-200/20 dark:bg-white/10 backdrop-blur-md animate-pulse" />
              )}
              {currentLogoSrc && !imgError ? (
                <img
                  src={currentLogoSrc}
                  alt="Organisation Logo"
                  className="w-full h-full object-cover absolute inset-0 z-10"
                  onError={() => setImgError(true)}
                />
              ) : (
                <Building2
                  className="w-10 h-10 opacity-50 z-0"
                  style={{ color: theme.text }}
                />
              )}
            </div>

            {/* Edit overlay */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer backdrop-blur-[2px] z-30"
              title="Change Logo"
            >
              <Camera size={24} strokeWidth={2.5} />
            </button>
          </div>
          <div>
            <p className="font-bold mb-1">Organisation Logo</p>
            <p className="text-xs opacity-60 max-w-xs">
              Upload a logo to display in the tenant switcher. Recommended size is 256x256.
            </p>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="mt-3 text-xs font-bold uppercase tracking-widest text-emerald-500 hover:text-emerald-400"
            >
              Upload New Logo
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handlePreSave} className="space-y-8">
        {/* --- Organisation Name --- */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-1 opacity-50">
            <Building2 size={14} />
            <label className="text-[10px] font-bold uppercase tracking-widest">
              Organisation Name
            </label>
          </div>
          <input
            type="text"
            name="orgName"
            value={orgName}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="w-full bg-transparent border-b py-3 text-lg focus:outline-none focus:border-current transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            style={{ borderColor: theme.navbar?.border }}
          />
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-red-500 text-xs font-bold uppercase tracking-wide mt-1"
          >
            <AlertCircle size={12} />
            {error}
          </motion.div>
        )}

        {/* --- Save Button --- */}
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-6 flex flex-col md:flex-row md:justify-end"
          >
            <button
              type="submit"
              disabled={!hasChanges || isLoading}
              className="px-8 py-4 rounded-full font-bold uppercase tracking-wider transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: hasChanges
                  ? theme.text
                  : "rgba(150,150,150,0.1)",
                color: hasChanges ? theme.bg : "rgba(150,150,150,0.5)",
              }}
            >
              {hasChanges ? "Review Changes" : "No Changes Detected"}
            </button>
          </motion.div>
        )}
      </form>

      {/* --- CONFIRMATION MODAL --- */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        theme={theme}
        title="Confirm Updates"
        description="The organisation name will be updated. Proceed?"
      >
        <div className="mt-4 space-y-4">
          <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="opacity-60 font-medium uppercase tracking-wide text-xs">
                New Name
              </span>
              <span className="font-bold">{orgName}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleFinalConfirm}
              disabled={isLoading}
              className="flex-1 py-3 px-6 rounded-xl font-bold text-sm uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2"
              style={{
                backgroundColor: theme.text,
                color: theme.bg,
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Saving...
                </>
              ) : (
                "Confirm & Save"
              )}
            </button>

            <button
              onClick={() => setIsModalOpen(false)}
              disabled={isLoading}
              className="flex-1 py-3 px-6 rounded-xl font-bold text-sm uppercase tracking-wider transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              style={{
                border: `1px solid ${theme.navbar?.border}`,
                color: theme.navbar?.textIdle || theme.text,
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      <AnimatePresence>
        {selectedFile && (
          <CropModal
            imageSrc={selectedFile}
            onCancel={() => {
              setSelectedFile(null);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            onSave={handleSaveCrop}
            theme={theme}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
