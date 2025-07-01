import React, { useRef } from 'react';
import { Camera, Upload } from 'lucide-react';

interface ImageUploadProps {
  onImageUpload: (file: File, detectionResult?: any) => void;
  disabled?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUpload, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      // Also run object detection on uploaded image
      try {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch('http://localhost:3001/api/detect-objects', {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          const detectionResult = await response.json();
          console.log('Image object detection result:', detectionResult);
          
          // Pass both the file and detection results
          onImageUpload(file, detectionResult);
        } else {
          // Fallback to regular image analysis
          onImageUpload(file);
        }
      } catch (error) {
        console.error('Object detection failed, using regular analysis:', error);
        onImageUpload(file);
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      <button
        onClick={handleClick}
        disabled={disabled}
        className="p-2 rounded-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
        title="Upload image for analysis"
      >
        <Camera className="w-4 h-4" />
      </button>
    </>
  );
};