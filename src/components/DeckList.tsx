import { CardDeck } from '../types/card';
import { Tag } from '../types/tag';
import './DeckList.css';

interface DeckListProps {
  decks: CardDeck[];
  tags: Tag[];
  selectedDeckId?: string;
  onSelect?: (deckId: string | undefined) => void;
  onEdit?: (deck: CardDeck) => void;
  onDelete?: (deckId: string) => void;
  onNewCard?: (deckId: string) => void;
  onPractice?: (deckId: string) => void;
  cardCounts?: Record<string, number>;
  filteredCardsCount?: number;
}

export default function DeckList({ 
  decks,
  tags,
  selectedDeckId, 
  onSelect, 
  onEdit, 
  onDelete,
  onNewCard,
  onPractice,
  cardCounts = {},
  filteredCardsCount = 0
}: DeckListProps) {
  const handleDeckClick = (deckId: string) => {
    if (onSelect) {
      onSelect(selectedDeckId === deckId ? undefined : deckId);
    }
  };

  return (
    <div className="deck-list">
      {decks.length === 0 ? (
        <div className="deck-list-empty">
          <p>No decks yet. Create your first deck to organize your cards!</p>
        </div>
      ) : (
        decks.map((deck) => {
          const isSelected = selectedDeckId === deck.id;
          const deckCardCount = cardCounts[deck.id] || 0;
          
          return (
            <div 
              key={deck.id} 
              className={`deck-item ${isSelected ? 'selected' : ''}`}
              onClick={() => handleDeckClick(deck.id)}
            >
              <div className="deck-info">
                <h3>{deck.name}</h3>
                {deck.description && (
                  <p className="deck-description">{deck.description}</p>
                )}
                {deck.tagIds && deck.tagIds.length > 0 && (
                  <div className="deck-tags">
                    {deck.tagIds.map(tagId => {
                      const tag = tags.find(t => t.id === tagId);
                      return tag ? (
                        <span key={tagId} className="deck-tag-badge">
                          {tag.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
                <p className="deck-count">
                  {deckCardCount} {deckCardCount === 1 ? 'card' : 'cards'}
                </p>
              </div>
              {isSelected && (
                <div className="deck-actions-expanded" onClick={(e) => e.stopPropagation()}>
                  {onPractice && (
                    <button
                      onClick={() => onPractice(deck.id)}
                      className="deck-action-btn deck-action-practice"
                      disabled={deckCardCount === 0}
                      title="Practice"
                      aria-label="Practice"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                      </svg>
                    </button>
                  )}
                  {onNewCard && (
                    <button
                      onClick={() => onNewCard(deck.id)}
                      className="deck-action-btn deck-action-new"
                      title="New Card"
                      aria-label="New Card"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    </button>
                  )}
                  {onEdit && (
                    <button
                      onClick={() => onEdit(deck)}
                      className="deck-action-btn deck-action-edit"
                      title="Edit"
                      aria-label="Edit"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(deck.id)}
                      className="deck-action-btn deck-action-delete"
                      title="Delete"
                      aria-label="Delete"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

