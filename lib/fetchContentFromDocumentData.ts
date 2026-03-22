export function fetchContentFromDocumentData(documentData: string): string {
  if (!documentData) return "";

  const matches = [
    ...documentData.matchAll(/<paragraph[^>]*>(.*?)<\/paragraph>/gi),
  ];

  return matches
    .map((match) => match[1].replace(/<[^>]*>/g, "").trim())
    .filter(Boolean) // remove empty paragraphs
    .join("\n");
}
