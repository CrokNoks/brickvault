export interface Manufacturer {
  _id?: string;
  name: string;
  country?: string;
  website?: string;
  created_at?: Date;
  sets: string[];
}
