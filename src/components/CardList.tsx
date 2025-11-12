import { Card, CardDeck } from '../types/card';
import './CardList.css';

interface CardListProps {
  cards: Card[];
  onEdit?: (card: Card) => void;
  onDelete?: (cardId: string) => void;
  decks?: CardDeck[];
}

export default function CardList({ cards, onEdit, onDelete, decks = [] }: CardListProps) {
  const getDeckName = (deckId?: string) => {
    if (!deckId) return null;
    return decks.find(d => d.id === deckId)?.name;
  };

  if (cards.length === 0) {
    return (
      <div className="card-list-empty">
        <p>No cards yet. Create your first card to get started!</p>
      </div>
    );
  }

  return (
    <div className="card-list">
      {cards.map((card) => {
        const deckName = getDeckName(card.deckId);
        return (
          <div key={card.id} className="card-item">
            {deckName && (
              <div className="card-deck-badge">
                🗂️ {deckName}
              </div>
            )}
            <div className="card-content">
              <div className="card-front">
                <span className="card-label">Front:</span>
                <p>{card.front}</p>
              </div>
              <div className="card-back">
                <span className="card-label">Back:</span>
                <p>{card.back}</p>
              </div>
            </div>
            {(onEdit || onDelete) && (
              <div className="card-actions">
                {onEdit && (
                  <button
                    onClick={() => onEdit(card)}
                    className="btn-icon btn-edit"
                    aria-label="Edit card"
                  >
                    ✏️
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(card.id)}
                    className="btn-icon btn-delete"
                    aria-label="Delete card"
                  >
                    🗑️
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

