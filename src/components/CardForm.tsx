import { useState, useEffect } from 'react';
import { Card, CardDeck } from '../types/card';
import { generateId } from '../utils/id';
import './CardForm.css';

interface CardFormProps {
  onSubmit: (card: Card) => void;
  onCancel?: () => void;
  initialCard?: Card;
  decks?: CardDeck[];
  selectedDeckId?: string;
}

export default function CardForm({ onSubmit, onCancel, initialCard, decks = [], selectedDeckId }: CardFormProps) {
  const [front, setFront] = useState(initialCard?.front || '');
  const [back, setBack] = useState(initialCard?.back || '');
  const [deckId, setDeckId] = useState(initialCard?.deckId || selectedDeckId || '');

  useEffect(() => {
    if (initialCard) {
      setFront(initialCard.front);
      setBack(initialCard.back);
      setDeckId(initialCard.deckId || selectedDeckId || '');
    } else {
      setFront('');
      setBack('');
      setDeckId(selectedDeckId || '');
    }
  }, [initialCard, selectedDeckId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!front.trim() || !back.trim() || !deckId) {
      if (!deckId) {
        alert('Please select a deck for this card.');
      }
      return;
    }

    const card: Card = {
      id: initialCard?.id || generateId(),
      front: front.trim(),
      back: back.trim(),
      deckId: deckId,
      createdAt: initialCard?.createdAt || Date.now(),
      updatedAt: Date.now(),
      difficulty: initialCard?.difficulty || 0,
      lastReviewed: initialCard?.lastReviewed,
      reviewCount: initialCard?.reviewCount || 0,
    };

    onSubmit(card);
    setFront('');
    setBack('');
    setDeckId(selectedDeckId || '');
  };

  return (
    <form className="card-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="front">Front (Question)</label>
        <textarea
          id="front"
          value={front}
          onChange={(e) => setFront(e.target.value)}
          placeholder="Enter the question or prompt..."
          rows={4}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="back">Back (Answer)</label>
        <textarea
          id="back"
          value={back}
          onChange={(e) => setBack(e.target.value)}
          placeholder="Enter the answer..."
          rows={4}
          required
        />
      </div>

      {decks.length > 0 ? (
        <div className="form-group">
          <label htmlFor="deck">Deck *</label>
          <select
            id="deck"
            value={deckId}
            onChange={(e) => setDeckId(e.target.value)}
            className="deck-select"
            required
          >
            <option value="">Select a deck</option>
            {decks.map((deck) => (
              <option key={deck.id} value={deck.id}>
                {deck.name}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="form-group">
          <p style={{ color: 'var(--text-secondary, rgba(255, 255, 255, 0.6))', fontSize: '0.9rem' }}>
            Please create a deck first before adding cards.
          </p>
        </div>
      )}

      <div className="form-actions">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary">
          {initialCard ? 'Update Card' : 'Create Card'}
        </button>
      </div>
    </form>
  );
}

