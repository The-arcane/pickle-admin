
'use server';

// Re-export actions from the central location to avoid code duplication.
export { addCourt, updateCourt, addCourtGalleryImages, deleteCourtGalleryImage } from '@/app/super-admin/courts/[id]/actions';
