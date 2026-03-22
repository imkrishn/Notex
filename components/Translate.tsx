"use client";

import {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";
import Spinner from "./Spinner";
import * as Y from "yjs";
import { fetchContentFromDocumentData } from "@/lib/fetchContentFromDocumentData";

const languages = [
  { code: "en", name: "English" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "es", name: "Spanish" },
  { code: "pt", name: "Portuguese" },
  { code: "it", name: "Italian" },
  { code: "nl", name: "Dutch" },
  { code: "ru", name: "Russian" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
  { code: "bn", name: "Bengali" },
  { code: "ur", name: "Urdu" },
  { code: "ta", name: "Tamil" },
  { code: "te", name: "Telugu" },
  { code: "mr", name: "Marathi" },
  { code: "gu", name: "Gujarati" },
  { code: "pa", name: "Punjabi" },
  { code: "vi", name: "Vietnamese" },
  { code: "th", name: "Thai" },
  { code: "tr", name: "Turkish" },
  { code: "id", name: "Indonesian" },
  { code: "ms", name: "Malay" },
  { code: "fa", name: "Persian" },
  { code: "he", name: "Hebrew" },
  { code: "pl", name: "Polish" },
  { code: "uk", name: "Ukrainian" },
  { code: "ro", name: "Romanian" },
  { code: "sv", name: "Swedish" },
  { code: "fi", name: "Finnish" },
  { code: "no", name: "Norwegian" },
  { code: "da", name: "Danish" },
  { code: "cs", name: "Czech" },
  { code: "el", name: "Greek" },
  { code: "hu", name: "Hungarian" },
  { code: "sk", name: "Slovak" },
  { code: "bg", name: "Bulgarian" },
  { code: "hr", name: "Croatian" },
  { code: "sr", name: "Serbian" },
  { code: "sl", name: "Slovenian" },
  { code: "lt", name: "Lithuanian" },
  { code: "lv", name: "Latvian" },
  { code: "et", name: "Estonian" },
  { code: "sw", name: "Swahili" },
  { code: "am", name: "Amharic" },
  { code: "ne", name: "Nepali" },
  { code: "si", name: "Sinhala" },
  { code: "my", name: "Burmese" },
  { code: "km", name: "Khmer" },
  { code: "lo", name: "Lao" },
  { code: "ka", name: "Georgian" },
  { code: "hy", name: "Armenian" },
  { code: "az", name: "Azerbaijani" },
  { code: "kk", name: "Kazakh" },
  { code: "uz", name: "Uzbek" },
];

const Translate = ({
  setUI,
  doc,
}: {
  setUI: Dispatch<SetStateAction<boolean>>;
  doc: Y.Doc;
}) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<string | null>(null);
  const [isTranslated, setIsTranslated] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<string | undefined>(
    undefined
  );
  const [isPending, startTransition] = useTransition();

  const handleClickOutside = (event: MouseEvent) => {
    if (divRef.current && !divRef.current.contains(event.target as Node)) {
      setUI(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  //translate the doc in provided languages
  async function onTranslating(language: string) {
    try {
      if (!language) return;

      startTransition(async () => {
        const documentData = doc.get("document-store").toJSON();
        const content = fetchContentFromDocumentData(documentData);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_AI_AGENT_URL}/translateDocument`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              documentData: content,
              targetLang: language,
            }),
          }
        );

        if (res.ok) {
          const { translated_text } = await res.json();

          setIsTranslated(true);
          setData(translated_text);
        } else {
          throw new Error("Translation API error");
        }
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to translate. Try again");
    }
  }

  return (
    <div
      ref={divRef}
      className="absolute z-50 left-1/2 top-20 transform -translate-x-1/2
      bg-(--color-base-100) border border-(--color-base-300)
      text-(--color-base-content)
      shadow-lg rounded-2xl p-6 w-full lg:w-1/3 h-[70%] overflow-y-auto
      backdrop-blur-xl transition-all duration-300"
    >
      {/* Title */}
      <h1 className="text-2xl font-semibold mb-4 decoration-(--color-primary)">
        🌍 Translate To
      </h1>

      {/* Translation output area */}
      {!isTranslated && (
        <div
          className="h-1/2 border border-(--color-base-300)
          rounded-xl flex flex-col justify-center items-center
          bg-(--color-base-200)/70 text-(--color-neutral-content-light)
          transition-all duration-300"
        >
          {isPending ? (
            <div className="flex items-center gap-3">
              <p>Translating...</p>
              <Spinner size={20} color="var(--color-primary)" />
            </div>
          ) : (
            <p className="text-sm italic">Translation will appear here ✨</p>
          )}
        </div>
      )}

      {isTranslated && !isPending && (
        <div
          className="min-h-28 border border-(--color-base-300)
          rounded-xl mt-4 p-5 bg-(--color-base-200)
          shadow-inner transition-all duration-300"
        >
          <h1 className="font-medium text-(--color-primary) mb-2">
            Translation in {currentLanguage}
          </h1>
          <p className="leading-relaxed">{data}</p>
        </div>
      )}

      <div className="mt-6">
        <label className="block text-sm mb-2 font-medium text-(--color-neutral-content-light)">
          Choose Language
        </label>
        <select
          disabled={isPending}
          onChange={(e) => {
            e.preventDefault();
            onTranslating(e.target.value);
          }}
          className="w-full bg-(--color-base-200) border border-(--color-base-300)
          text-(--color-base-content) rounded-lg p-2
          focus:outline-none focus:ring-2 focus:ring-(--color-primary)
          cursor-pointer transition-all duration-200"
        >
          <option value="">Select...</option>
          {languages.map((language) => (
            <option
              onClick={() => setCurrentLanguage(language.name)}
              key={language.name}
              value={language.code}
              className="bg-(--color-base-100) text-(--color-base-content)"
            >
              {language.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Translate;
