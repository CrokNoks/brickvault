export type Comment = {
  _id?: string;
  user_id: string;
  target_type: 'set' | 'instruction';
  target_id: string;
  content: string;
  created_at?: Date;
};
