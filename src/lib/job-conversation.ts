export type ChatMessage = {
  id: string;
  author: string;
  own: boolean;
  seen: boolean;
  update: boolean;
  body: string;
  at: string;
  reads: { name: string; at: string }[];
};
