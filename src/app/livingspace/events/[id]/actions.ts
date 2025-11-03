
'use server';

// Re-export actions from the central location to avoid code duplication.
export { addEvent, updateEvent, addEventGalleryImages, deleteEventGalleryImage, deleteEvent, cancelEventBooking } from '@/app/super-admin/events/[id]/actions';
