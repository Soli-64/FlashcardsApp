export interface Card {
  id: string;
  front: string;
  back: string;
  deckId: string;
  createdAt: number;
  updatedAt: number;
  difficulty?: number;
  lastReviewed?: number;
  reviewCount?: number;
}

export interface CardDeck {
  id: string;
  name: string;
  description?: string;
  tagIds?: string[];
  createdAt: number;
  updatedAt: number;
}

