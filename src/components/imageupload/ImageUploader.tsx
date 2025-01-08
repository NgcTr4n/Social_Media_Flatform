import React, { useState, ChangeEvent } from "react";
import image_upload from "../../assets/logo/image-upload.png"; // Default upload image
import "./ImageUploader.css";

interface ImageUploaderProps {
  onChange: (file: File | null) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onChange }) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [labelText, setLabelText] = useState<string>("Drop your image here");
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);

      setIsAnimating(true);
      setLabelText("Processing...");

      // Simulate a delay for the animation
      setTimeout(() => {
        const img = new Image();

        img.onload = () => {
          const canvas = document.createElement("canvas");
          const size = 300; // Desired square size
          const ctx = canvas.getContext("2d");

          canvas.width = size;
          canvas.height = size;

          // Calculate scale and position to center the image
          const scale = Math.max(size / img.width, size / img.height);
          const x = (size - img.width * scale) / 2;
          const y = (size - img.height * scale) / 2;

          // Draw the resized image onto the canvas
          ctx?.drawImage(img, x, y, img.width * scale, img.height * scale);

          // Get the resized image URL and set it as the preview
          const resizedImageUrl = canvas.toDataURL("image/jpeg");
          setPreviewImage(resizedImageUrl);
          setLabelText("Image uploaded successfully");
          setIsAnimating(false);

          // Send the file back to the parent component
          onChange(file);
        };

        img.onerror = () => {
          setLabelText("Failed to load image. Try again.");
          setIsAnimating(false);
        };

        img.src = imageUrl;
      }, 300); // Match delay with CSS animation duration
    } else {
      setPreviewImage(null);
      setLabelText("Drop your image here");
      onChange(null);
    }
  };

  return (
    <div className="custom-upload">
      <input
        type="file"
        id="fileInput"
        onChange={handleImageUpload}
        accept="image/*"
      />
      <label htmlFor="fileInput" className="upload-label">
        <div
          className={`image-container ${isAnimating ? "fade-out" : "fade-in"}`}
        >
          {previewImage ? (
            <img
              src={previewImage}
              alt="Uploaded Preview"
              className="upload-preview"
            />
          ) : (
            <img src={image_upload} alt="Upload Icon" className="upload-icon" />
          )}
        </div>
        <span>{labelText}</span>
      </label>
    </div>
  );
};

export default ImageUploader;
