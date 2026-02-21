"use client";

import { useState, useEffect } from "react";

interface ContentItem {
  id: string;
  key: string;
  value: string;
  content_type: string;
  section: string;
  label: string | null;
}

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero Sectie",
  pricing: "Prijzen",
  how_it_works: "Zo Werkt Het",
  what_you_get: "Wat Krijg Je",
  personal_advice: "Persoonlijk Biedadvies",
  benefits: "Voordelen",
  mission: "Missie & Visie",
  why_juistebod: "Waarom JuisteBod",
  testimonials: "Testimonials / Reviews",
  footer: "Footer",
};

const SECTION_ORDER = [
  "hero",
  "pricing",
  "how_it_works",
  "what_you_get",
  "personal_advice",
  "benefits",
  "mission",
  "why_juistebod",
  "testimonials",
  "footer",
];

export default function ContentPage() {
  const [content, setContent] = useState<Record<string, ContentItem[]>>({});
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const res = await fetch("/api/admin/content");
      const data = await res.json();
      if (data.success) {
        setContent(data.data);
        const initial: Record<string, string> = {};
        Object.values(data.data as Record<string, ContentItem[]>)
          .flat()
          .forEach((item) => {
            initial[item.key] = item.value;
          });
        setEditedValues(initial);
      }
    } catch {
      setMessage({ type: "error", text: "Kon content niet laden" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setEditedValues((prev) => ({ ...prev, [key]: value }));
  };

  const getChangedItems = () => {
    const changes: { key: string; value: string }[] = [];
    const allItems = Object.values(content).flat();
    for (const item of allItems) {
      if (editedValues[item.key] !== undefined && editedValues[item.key] !== item.value) {
        changes.push({ key: item.key, value: editedValues[item.key] });
      }
    }
    return changes;
  };

  const handleSave = async () => {
    const changes = getChangedItems();
    if (changes.length === 0) {
      setMessage({ type: "success", text: "Geen wijzigingen om op te slaan" });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates: changes }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: `${changes.length} item(s) opgeslagen!` });
        await fetchContent();
      } else {
        setMessage({ type: "error", text: data.error || "Opslaan mislukt" });
      }
    } catch {
      setMessage({ type: "error", text: "Er is iets misgegaan" });
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const changedCount = getChangedItems().length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-gray-300 border-t-blue-600 rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Content Beheer</h1>
          <p className="text-gray-500 text-sm mt-1">
            Pas de teksten en prijzen aan op de hoofdpagina
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || changedCount === 0}
          className="px-6 py-2.5 rounded-lg font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: changedCount > 0 ? "#1F3C88" : "#9ca3af" }}
        >
          {saving ? "Opslaan..." : changedCount > 0 ? `Opslaan (${changedCount})` : "Opslaan"}
        </button>
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

      <div className="space-y-4">
        {SECTION_ORDER.filter((s) => content[s]).map((section) => {
          const items = content[section];
          const isOpen = openSections[section] !== false;
          const sectionChanges = items.filter(
            (item) => editedValues[item.key] !== undefined && editedValues[item.key] !== item.value
          ).length;

          return (
            <div key={section} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleSection(section)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-90" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <h2 className="text-lg font-semibold text-gray-800">
                    {SECTION_LABELS[section] || section}
                  </h2>
                  <span className="text-xs text-gray-400">({items.length} items)</span>
                </div>
                {sectionChanges > 0 && (
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    {sectionChanges} gewijzigd
                  </span>
                )}
              </button>

              {isOpen && (
                <div className="border-t border-gray-100 p-4 space-y-4">
                  {items.map((item) => {
                    const isChanged = editedValues[item.key] !== item.value;
                    const isLongText = item.value.length > 100;
                    const isPrice = item.content_type === "price";

                    return (
                      <div key={item.key} className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {item.label || item.key}
                          {isPrice && (
                            <span className="ml-2 text-xs text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded">
                              Prijs
                            </span>
                          )}
                          {isChanged && (
                            <span className="ml-2 text-xs text-blue-600">gewijzigd</span>
                          )}
                        </label>
                        {isLongText || item.content_type === "json" ? (
                          <textarea
                            value={editedValues[item.key] ?? item.value}
                            onChange={(e) => handleChange(item.key, e.target.value)}
                            rows={item.content_type === "json" ? 3 : 4}
                            className={`w-full px-3 py-2 border rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              isChanged ? "border-blue-300 bg-blue-50/30" : "border-gray-300"
                            }`}
                          />
                        ) : (
                          <input
                            type={isPrice ? "text" : "text"}
                            value={editedValues[item.key] ?? item.value}
                            onChange={(e) => handleChange(item.key, e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              isChanged ? "border-blue-300 bg-blue-50/30" : "border-gray-300"
                            }`}
                          />
                        )}
                        {isChanged && (
                          <button
                            onClick={() => handleChange(item.key, item.value)}
                            className="absolute top-0 right-0 text-xs text-gray-400 hover:text-gray-600"
                          >
                            Ongedaan maken
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {changedCount > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 rounded-lg font-medium text-white shadow-lg transition-all disabled:opacity-50"
            style={{ backgroundColor: "#1F3C88" }}
          >
            {saving ? "Opslaan..." : `${changedCount} wijziging(en) opslaan`}
          </button>
        </div>
      )}
    </div>
  );
}
