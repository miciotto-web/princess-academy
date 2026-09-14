/** Tipi riga database Supabase (snake_case) + adattatori verso i tipi UI. */

export type DbPrincess = {
  id: string;
  name: string;
  slug: string;
  character_name: string | null;
  role: string | null;
  description: string | null;
  biography: string | null;
  specialties: string[] | null;
  main_image: string | null;
  social_instagram: string | null;
  social_tiktok: string | null;
  is_active: boolean;
  display_order: number;
};

export type DbPrincessImage = {
  id: string;
  princess_id: string;
  file_url: string;
  title: string | null;
  display_order: number;
};

export type DbEvent = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  main_image: string | null;
  duration: string | null;
  services: string[] | null;
  price: string | null;
  information: string | null;
  availability: string | null;
  category_id: string | null;
  display_order: number;
  published: boolean;
  icon: string | null;
  gradient: string | null;
  event_categories?: { name: string } | null;
};

export type DbGallery = {
  id: string;
  file_url: string;
  thumbnail_url: string | null;
  title: string | null;
  description: string | null;
  event_date: string | null;
  event_id: string | null;
  category_id: string | null;
  display_order: number;
  published: boolean;
  gallery_categories?: { name: string } | null;
  events?: { title: string } | null;
};

export type DbTimeline = {
  id: string;
  year: string;
  title: string;
  description: string | null;
  image: string | null;
  display_order: number;
  published: boolean;
};

export type DbSocial = {
  id: string;
  name: string;
  url: string;
  icon: string;
  description: string | null;
  display_order: number;
  active: boolean;
};

export type DbBooking = {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  event_date: string;
  event_time: string;
  location: string;
  event_type: string;
  guests: string | null;
  children_age: string | null;
  princess_id: string | null;
  duration: string | null;
  servizi: string | null;
  message: string | null;
  status: BookingStatus;
  admin_notes: string | null;
  privacy_accepted: boolean;
  princesses?: { name: string } | null;
};

export const BOOKING_STATUS = [
  "NUOVA",
  "CONTATTATA",
  "IN TRATTATIVA",
  "CONFERMATA",
  "COMPLETATA",
  "ANNULLATA",
] as const;

export type BookingStatus = (typeof BOOKING_STATUS)[number];
