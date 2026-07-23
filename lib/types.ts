export type Portrait = {
  id: string;
  title: string;
  image_url: string;
  tags: string[];
  price: number | null;
  created_at: string;
};

/** Public-facing shape — price is intentionally omitted from the gallery (PRD §8). */
export type PublicPortrait = Omit<Portrait, "price">;
