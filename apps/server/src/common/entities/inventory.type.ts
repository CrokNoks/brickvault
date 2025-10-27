export type Inventory = {
  _id?: string;
  set_id?: string;
  pieces?: {
    piece_id: string;
    quantity?: number;
  }[];
  quantity?: number;
};
