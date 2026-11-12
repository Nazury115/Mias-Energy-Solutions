export type ChatMessage = {
  id: string;
  author: string;
  own: boolean;
  seen: boolean;
  update: boolean;
  attachment: boolean;
  download: string | null;
  body: string;
  at: string;
  reads: { name: string; at: string }[];
};
