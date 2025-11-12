import { Preferences } from '@capacitor/preferences';
import { Card, CardDeck } from '../types/card';

const CARDS_KEY = 'cards';
const DECKS_KEY = 'decks';

export class CardStorage {
  // Card operations
  static async getAllCards(): Promise<Card[]> {
    try {
      const { value } = await Preferences.get({ key: CARDS_KEY });
      return value ? JSON.parse(value) : [];
    } catch (error) {
      console.error('Error getting cards:', error);
      return [];
    }
  }

  static async saveCard(card: Card): Promise<void> {
    const cards = await this.getAllCards();
    const existingIndex = cards.findIndex(c => c.id === card.id);
    
    if (existingIndex >= 0) {
      cards[existingIndex] = { ...card, updatedAt: Date.now() };
    } else {
      cards.push({ ...card, createdAt: Date.now(), updatedAt: Date.now() });
    }
    
    await Preferences.set({ key: CARDS_KEY, value: JSON.stringify(cards) });
  }

  static async deleteCard(cardId: string): Promise<void> {
    const cards = await this.getAllCards();
    const filtered = cards.filter(c => c.id !== cardId);
    await Preferences.set({ key: CARDS_KEY, value: JSON.stringify(filtered) });
  }

  static async getCardsByDeck(deckId: string): Promise<Card[]> {
    const cards = await this.getAllCards();
    return cards.filter(c => c.deckId === deckId);
  }

  // Deck operations
  static async getAllDecks(): Promise<CardDeck[]> {
    try {
      const { value } = await Preferences.get({ key: DECKS_KEY });
      return value ? JSON.parse(value) : [];
    } catch (error) {
      console.error('Error getting decks:', error);
      return [];
    }
  }

  static async saveDeck(deck: CardDeck): Promise<void> {
    const decks = await this.getAllDecks();
    const existingIndex = decks.findIndex(d => d.id === deck.id);
    
    if (existingIndex >= 0) {
      decks[existingIndex] = { ...deck, updatedAt: Date.now() };
    } else {
      decks.push({ ...deck, createdAt: Date.now(), updatedAt: Date.now() });
    }
    
    await Preferences.set({ key: DECKS_KEY, value: JSON.stringify(decks) });
  }

  static async deleteDeck(deckId: string): Promise<void> {
    const decks = await this.getAllDecks();
    const filtered = decks.filter(d => d.id !== deckId);
    await Preferences.set({ key: DECKS_KEY, value: JSON.stringify(filtered) });
    
    // Delete all cards in this deck (cards must belong to a deck)
    const cards = await this.getAllCards();
    const filteredCards = cards.filter(card => card.deckId !== deckId);
    await Preferences.set({ key: CARDS_KEY, value: JSON.stringify(filteredCards) });
  }
}

