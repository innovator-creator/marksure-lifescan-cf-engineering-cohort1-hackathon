interface OCRSpaceResponse {
  IsErroredOnProcessing: boolean;
  ErrorMessage?: string;
  ParsedResults?: Array<{
    ParsedText: string;
  }>;
}

export async function extractTextFromImage(imageBuffer: Buffer): Promise<string> {
  const apiKey = process.env.OCRSPACE_API_KEY;
  
  if (!apiKey) {
    throw new Error('OCRSPACE_API_KEY environment variable is not set');
  }

  const formData = new FormData();
  formData.append('file', new Blob([imageBuffer as unknown as ArrayBuffer]), 'image.jpg');
  formData.append('language', 'eng');
  formData.append('isOverlayRequired', 'false');
  formData.append('scale', 'true');
  formData.append('detectOrientation', 'true');
  formData.append('OCREngine', '2');

  const response = await fetch('https://api.ocr.space/parse/image', {
    method: 'POST',
    headers: {
      apikey: apiKey,
    },
    body: formData,
  });

  const data: OCRSpaceResponse = await response.json();

  if (data.IsErroredOnProcessing) {
    throw new Error(data.ErrorMessage || 'OCR processing failed');
  }

  if (!data.ParsedResults || data.ParsedResults.length === 0) {
    throw new Error('No text found in image');
  }

  return data.ParsedResults[0].ParsedText.trim();
}
