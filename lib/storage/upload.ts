import { createAdminClient } from '@/lib/supabase/admin';

const BUCKET_NAME = 'report-images';

/**
 * Upload a file buffer to Supabase Storage
 * @param fileBuffer - The file buffer to upload
 * @param fileName - The name to give the file in storage
 * @param contentType - The MIME type of the file
 * @returns The public URL of the uploaded file
 */
export async function uploadReportImage(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  const supabase = createAdminClient();

  // Generate a unique filename with timestamp to avoid collisions
  const timestamp = Date.now();
  const uniqueFileName = `${timestamp}-${fileName}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(uniqueFileName, fileBuffer, {
      contentType,
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path);

  return publicUrl;
}

/**
 * Delete a file from Supabase Storage
 * @param path - The path of the file in storage
 */
export async function deleteReportImage(path: string): Promise<void> {
  const supabase = createAdminClient();

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([path]);

  if (error) {
    throw new Error(`Failed to delete image: ${error.message}`);
  }
}
