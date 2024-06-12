import { Image as ImageIcon, X } from "lucide-react";
import Image from "next/image";
import { FC, useRef } from "react";
import { Button } from "../../button";
import { InputImageStore, useInputImage } from "./input-image-store";

export const ImageInput: FC = () => {
  const { base64Image, previewImage } = useInputImage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    fileInputRef.current?.click();
  };

  const resetFileInput = () => {
    InputImageStore.Reset();
  };

  return (
    <div className="flex gap-2">
      {previewImage && (
        <div className="relative overflow-hidden rounded-md w-[35px] h-[35px]">
          <Image src={previewImage} alt="Preview" fill={true} />
          <button
            className="absolute right-1 top-1 bg-background/20 rounded-full p-[2px]"
            onClick={resetFileInput}
            aria-label="Remove image from chat input"
          >
            <X size={12} className="stroke-background" />
          </button>
        </div>
      )}
      <input
        type="hidden"
        name="image-base64"
        value={base64Image}
        onChange={(e) => InputImageStore.UpdateBase64Image(e.target.value)}
      />
      <input
        type="file"
        accept="image/*"
        name="image"
        ref={fileInputRef}
        className="hidden"
        onChange={(e) => InputImageStore.OnFileChange(e)}
      />
      <Button
        size="icon"
        variant={"ghost"}
        type="button"
        onClick={handleButtonClick}
        aria-label="Add an image to the chat input"
      >
        <ImageIcon size={16} />
      </Button>
    </div>
  );
};
