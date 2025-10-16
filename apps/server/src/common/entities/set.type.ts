export type Set = {
  _id?: string;
  manufacturer_reference: string;
  name: string;
  year?: number;
  theme?: string;
  piece_count?: number;
  image_url?: string;
  manufacturer: string | { _id: string; name: string };
  created_at?: Date;
};
