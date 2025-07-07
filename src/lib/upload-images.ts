'use client';

import { createClient } from '../lib/supabase/client';

export async function uploadImage(file: File, path = 'court-images') {
  const supabase = createClient();
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `${path}/${fileName}`;

  const { data, error } = await supabase.storage
    .from('court-images') // 
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data: publicUrlData } = supabase
    .storage
    .from('court-images')
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}
