import { useState } from 'react';
import { CardDeck } from '../types/card';
import { generateId } from '../utils/id';
import './DeckForm.css';

interface DeckFormProps {
  onSubmit: (deck: CardDeck) => void;
  onCancel?: () => void;
  initialDeck?: CardDeck;
}

export default function DeckForm({ onSubmit, onCancel, initialDeck }: DeckFormProps) {
  const [name, setName] = useState(initialDeck?.name || '');
  const [description, setDescription] = useState(initialDeck?.description || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      return;
    }

    const deck: CardDeck = {
      id: initialDeck?.id || generateId(),
      name: name.trim(),
      description: description.trim() || undefined,
      createdAt: initialDeck?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    onSubmit(deck);
    setName('');
    setDescription('');
  };

  return (
    <form className="deck-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="name">Deck Name</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description (Optional)</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter a description for this deck..."
          rows={3}
        />
      </div>

      <div className="form-actions">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary">
          {initialDeck ? 'Update Deck' : 'Create Deck'}
        </button>
      </div>
    </form>
  );
}

