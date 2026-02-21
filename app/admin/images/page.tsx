"use client";

import { useState } from "react";
import Image from "next/image";

interface ImageItem {
  id: string;
  label: string;
  currentSrc: string;
  description: string;
}

const MANAGED_IMAGES: ImageItem[] = [
  {
    id: "hero_1",
    label: "Hero foto 1",
    currentSrc: "/landing_page_photos/artists-eyes-tHV0jeh_Yd4-unsplash.jpg",
    description: "Eerste achtergrondafbeelding in de hero carousel",
  },
  {
    id: "hero_2",
    label: "Hero foto 2",
    currentSrc: "/landing_page_photos/anya-chernik-LXHbMXfFrhw-unsplash.jpg",
    description: "Tweede achtergrondafbeelding in de hero carousel",
  },
  {
    id: "logo_front",
    label: "Logo (navigatie)",
    currentSrc: "/Juistebod logo voorkant.png",
    description: "Logo in de navigatiebalk",
  },
  {
    id: "logo_top",
    label: "Logo (footer)",
    currentSrc: "/Juiste bod logo boven.png",
    description: "Logo in de footer",
  },
  {
    id: "contact_photo",
    label: "Contactpersoon foto",
    currentSrc: "/images/Netraam_foto.jpeg",
    description: "Foto van de contactpersoon in de footer",
  },
];

export default function ImagesPage() {
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleFileUpload = async (imageId: string, file: File) => {
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("imageId", imageId);

    try {
      const res = await fetch("/api/admin/images", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: `${imageId} succesvol geüpload! Herlaad de pagina om de wijziging te zien.` });
      } else {
        setMessage({ type: "error", text: data.error || "Upload mislukt" });
      }
    } catch {
      setMessage({ type: "error", text: "Er is iets misgegaan bij het uploaden" });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Afbeeldingen</h1>
        <p className="text-gray-500 text-sm mt-1">
          Beheer de afbeeldingen op de website. Upload een nieuwe afbeelding om de huidige te vervangen.
        </p>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        {MANAGED_IMAGES.map((img) => (
          <div
            key={img.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                <div className="w-40 h-28 rounded-lg overflow-hidden bg-gray-100 relative">
                  <Image
                    src={img.currentSrc}
                    alt={img.label}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">{img.label}</h3>
                <p className="text-sm text-gray-500 mb-3">{img.description}</p>
                <p className="text-xs text-gray-400 mb-3 font-mono">{img.currentSrc}</p>
                <label className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Nieuwe afbeelding uploaden
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(img.id, file);
                    }}
                  />
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-700">
          <strong>Let op:</strong> Geüploade afbeeldingen worden opgeslagen in de public folder.
          De oorspronkelijke bestandsnaam wordt behouden. Zorg dat het bestand het juiste formaat heeft
          (JPG voor foto's, PNG voor logo's).
        </p>
      </div>
    </div>
  );
}
