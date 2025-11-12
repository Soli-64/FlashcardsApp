import { useEffect, useMemo, useState } from 'react';
import './App.css';
import CardForm from './components/CardForm';
import DeckForm from './components/DeckForm';
import DeckList from './components/DeckList';
import Modal from './components/Modal';
import PracticeMode from './components/PracticeMode';
import TagManager from './components/TagManager';
import { CardStorage } from './services/storage';
import { Card, CardDeck } from './types/card';
import { Tag } from './types/tag';

type ViewMode = 'decks' | 'card-form' | 'deck-form' | 'practice';

function App() {
  const [cards, setCards] = useState<Card[]>([]);
  const [decks, setDecks] = useState<CardDeck[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('decks');
  const [selectedDeckId, setSelectedDeckId] = useState<string | undefined>();
  const [editingCard, setEditingCard] = useState<Card | undefined>();
  const [editingDeck, setEditingDeck] = useState<CardDeck | undefined>();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; deckId: string | null; cardCount: number }>({
    isOpen: false,
    deckId: null,
    cardCount: 0
  });

  useEffect(() => {
    loadData();
    
    // Disable context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    
    // Disable zoom gestures
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    };
    
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const loadData = async () => {
    await Promise.all([loadCards(), loadDecks(), loadTags()]);
  };

  const loadCards = async () => {
    const loadedCards = await CardStorage.getAllCards();
    setCards(loadedCards);
  };

  const loadDecks = async () => {
    const loadedDecks = await CardStorage.getAllDecks();
    setDecks(loadedDecks);
  };

  const loadTags = async () => {
    const loadedTags = await CardStorage.getAllTags();
    setTags(loadedTags);
  };

  // Calculate card counts per deck
  const cardCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    cards.forEach(card => {
      counts[card.deckId] = (counts[card.deckId] || 0) + 1;
    });
    return counts;
  }, [cards]);

  // Filter cards by selected deck
  const filteredCards = useMemo(() => {
    if (selectedDeckId === undefined) {
      return [];
    }
    return cards.filter(card => card.deckId === selectedDeckId);
  }, [cards, selectedDeckId]);

  // Filter decks by search query and tags
  const filteredDecks = useMemo(() => {
    let filtered = decks;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(deck => 
        deck.name.toLowerCase().includes(query) ||
        (deck.description && deck.description.toLowerCase().includes(query))
      );
    }

    // Filter by selected tag IDs
    if (selectedTagIds.length > 0) {
      filtered = filtered.filter(deck => {
        if (!deck.tagIds || deck.tagIds.length === 0) return false;
        return selectedTagIds.every(tagId => deck.tagIds!.includes(tagId));
      });
    }

    return filtered;
  }, [decks, searchQuery, selectedTagIds]);

  // Card handlers
  const handleCreateCard = async (card: Card) => {
    await CardStorage.saveCard(card);
    await loadCards();
    setViewMode('decks');
    setEditingCard(undefined);
  };


  // Deck handlers
  const handleCreateDeck = async (deck: CardDeck) => {
    await CardStorage.saveDeck(deck);
    await loadDecks();
    setViewMode('decks');
    setEditingDeck(undefined);
  };

  const handleTagManagerClose = async () => {
    setIsTagManagerOpen(false);
    await loadTags();
    await loadDecks();
  };

  const handleEditDeck = (deck: CardDeck) => {
    setEditingDeck(deck);
    setViewMode('deck-form');
  };

  const handleDeleteDeck = (deckId: string) => {
    const deckCards = cards.filter(c => c.deckId === deckId);
    const cardCount = deckCards.length;
    setDeleteModal({
      isOpen: true,
      deckId,
      cardCount
    });
  };

  const confirmDeleteDeck = async () => {
    if (!deleteModal.deckId) return;
    
    const deckCards = cards.filter(c => c.deckId === deleteModal.deckId);
    // Delete all cards in this deck first
    for (const card of deckCards) {
      await CardStorage.deleteCard(card.id);
    }
    await CardStorage.deleteDeck(deleteModal.deckId);
    await loadData();
    if (selectedDeckId === deleteModal.deckId) {
      setSelectedDeckId(undefined);
    }
    setDeleteModal({ isOpen: false, deckId: null, cardCount: 0 });
  };

  const handleDeckSelect = (deckId: string | undefined) => {
    setSelectedDeckId(deckId);
    setViewMode('decks');
  };

  const handleCancel = () => {
    setViewMode('decks');
    setEditingCard(undefined);
    setEditingDeck(undefined);
  };

  if (viewMode === 'practice') {
    return (
      <PracticeMode
        cards={filteredCards}
        onExit={() => setViewMode('decks')}
      />
    );
  }

  return (
    <div className="app">
      <main className="app-main">
        {viewMode === 'decks' && (
          <>
            <div className="search-container">
              <div className="search-input-wrapper">
                <input
                  type="text"
                  placeholder="Search decks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                <button
                  type="button"
                  onClick={() => setIsTagManagerOpen(true)}
                  className="tag-manager-button"
                  title="Manage Tags"
                >
                  Tags
                </button>
              </div>
              {tags.length > 0 && (
                <div className="tag-filter-container">
                  <div className="tag-filter-list">
                    {tags.map(tag => (
                      <button
                        key={tag.id}
                        type="button"
                        style={{ backgroundColor: selectedTagIds.includes(tag.id) ? tag.color : '#1a1a1a' }}
                        onClick={() => {
                          if (selectedTagIds.includes(tag.id)) {
                            setSelectedTagIds(selectedTagIds.filter(id => id !== tag.id));
                          } else {
                            setSelectedTagIds([...selectedTagIds, tag.id]);
                          }
                        }}
                        className="tag-badge-filter"
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                  {selectedTagIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedTagIds([])}
                      className="tag-filter-clear"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              )}
            </div>
            <DeckList
              decks={filteredDecks}
              tags={tags}
              selectedDeckId={selectedDeckId}
              onSelect={handleDeckSelect}
              onEdit={handleEditDeck}
              onDelete={handleDeleteDeck}
              onNewCard={(deckId) => {
                setSelectedDeckId(deckId);
                setEditingCard(undefined);
                setViewMode('card-form');
              }}
              onPractice={(deckId) => {
                setSelectedDeckId(deckId);
                const deckCards = cards.filter(card => card.deckId === deckId);
                if (deckCards.length > 0) {
                  setViewMode('practice');
                }
              }}
              cardCounts={cardCounts}
              filteredCardsCount={filteredCards.length}
            />
            <div className="practice-button-container">
              <button
                onClick={() => {
                  setEditingDeck(undefined);
                  setViewMode('deck-form');
                }}
                className="btn btn-primary btn-large"
              >
                New Deck
              </button>
            </div>
          </>
        )}

        {viewMode === 'card-form' && (
          <div className="form-container">
            <CardForm
              onSubmit={handleCreateCard}
              onCancel={handleCancel}
              initialCard={editingCard}
              decks={decks}
              selectedDeckId={selectedDeckId}
            />
          </div>
        )}

        {viewMode === 'deck-form' && (
          <div className="form-container">
            <DeckForm
              onSubmit={handleCreateDeck}
              onCancel={handleCancel}
              initialDeck={editingDeck}
            />
          </div>
        )}
      </main>
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, deckId: null, cardCount: 0 })}
        onConfirm={confirmDeleteDeck}
        title="Delete Deck"
        message={`Are you sure you want to delete this deck? This will also delete ${deleteModal.cardCount} card${deleteModal.cardCount !== 1 ? 's' : ''} in this deck.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="btn-danger"
      />
      <TagManager
        isOpen={isTagManagerOpen}
        onClose={handleTagManagerClose}
      />
    </div>
  );
}

export default App;
