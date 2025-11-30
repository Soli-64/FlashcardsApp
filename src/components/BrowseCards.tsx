import { useMemo, useState } from 'react';
import { Card, CardDeck } from '../types/card';
import './BrowseCards.css';

interface BrowseCardsProps {
  cards: Card[];
  decks: CardDeck[];
  onEdit: (card: Card) => void;
  onDelete: (cardId: string) => void;
  onClose: () => void;
}

type SortOption = 'recent' | 'oldest' | 'front' | 'deck';

export default function BrowseCards({ cards, decks, onEdit, onDelete, onClose }: BrowseCardsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [selectedDeckFilter, setSelectedDeckFilter] = useState<string>('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const getDeckName = (deckId: string) => {
    return decks.find(d => d.id === deckId)?.name || 'Unknown Deck';
  };

  const filteredAndSortedCards = useMemo(() => {
    let filtered = cards;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(card =>
        card.front.toLowerCase().includes(query) ||
        card.back.toLowerCase().includes(query) ||
        getDeckName(card.deckId).toLowerCase().includes(query)
      );
    }

    // Filter by deck
    if (selectedDeckFilter) {
      filtered = filtered.filter(card => card.deckId === selectedDeckFilter);
    }

    // Sort
    const sorted = [...filtered];
    switch (sortBy) {
      case 'recent':
        sorted.sort((a, b) => b.updatedAt - a.updatedAt);
        break;
      case 'oldest':
        sorted.sort((a, b) => a.createdAt - b.createdAt);
        break;
      case 'front':
        sorted.sort((a, b) => a.front.localeCompare(b.front));
        break;
      case 'deck':
        sorted.sort((a, b) => {
          const deckCmp = getDeckName(a.deckId).localeCompare(getDeckName(b.deckId));
          return deckCmp !== 0 ? deckCmp : b.updatedAt - a.updatedAt;
        });
        break;
    }

    return sorted;
  }, [cards, searchQuery, sortBy, selectedDeckFilter, decks]);

  const handleDeleteConfirm = (cardId: string) => {
    onDelete(cardId);
    setDeleteConfirm(null);
  };

  return (
    <div className="browse-cards-container">
      <div className="browse-cards-header">
        <h2>Browse & Edit Cards</h2>
        <button onClick={onClose} className="btn-close-browse">
          ✕
        </button>
      </div>

      <div className="browse-cards-controls">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search cards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="browse-search-input"
          />
        </div>

        <div className="filter-sort-section">
          <div className="filter-group">
            <label htmlFor="deck-filter">Deck:</label>
            <select
              id="deck-filter"
              value={selectedDeckFilter}
              onChange={(e) => setSelectedDeckFilter(e.target.value)}
              className="browse-select"
            >
              <option value="">All Decks</option>
              {decks.map(deck => (
                <option key={deck.id} value={deck.id}>
                  {deck.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="sort-by">Sort by:</label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="browse-select"
            >
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest</option>
              <option value="front">Front Text (A-Z)</option>
              <option value="deck">Deck Name</option>
            </select>
          </div>
        </div>
      </div>

      {filteredAndSortedCards.length === 0 ? (
        <div className="browse-cards-empty">
          <p>No cards found. Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="browse-cards-list">
          {filteredAndSortedCards.map(card => (
            <div key={card.id} className="browse-card-item">
              <div className="browse-card-info">
                <div className="browse-card-front">
                  <span className="browse-card-label">Q:</span>
                  <p className="browse-card-text">{card.front}</p>
                </div>
                <div className="browse-card-back">
                  <span className="browse-card-label">A:</span>
                  <p className="browse-card-text">{card.back}</p>
                </div>
                <div className="browse-card-meta">
                  <small>{getDeckName(card.deckId)}</small>
                </div>
              </div>
              <div className="browse-card-actions-inline" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => onEdit(card)}
                  className="browse-card-btn browse-card-edit"
                  title="Edit card"
                  aria-label="Edit card"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
                {deleteConfirm === card.id ? (
                  <div className="delete-confirm">
                    <button
                      onClick={() => handleDeleteConfirm(card.id)}
                      className="browse-card-btn browse-card-delete-yes"
                      title="Confirm delete"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="browse-card-btn browse-card-delete-no"
                      title="Cancel delete"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(card.id)}
                    className="browse-card-btn browse-card-delete"
                    title="Delete card"
                    aria-label="Delete card"
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
            </div>
          ))}
        
        </div>
      )}
    </div>
  );
}
