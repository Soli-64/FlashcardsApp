import { useState, useEffect } from 'react';
import { CardDeck } from '../types/card';
import { Tag } from '../types/tag';
import { CardStorage } from '../services/storage';
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
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(initialDeck?.tagIds || []);
  const [allTags, setAllTags] = useState<Tag[]>([]);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    const tags = await CardStorage.getAllTags();
    setAllTags(tags);
  };

  const toggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      setSelectedTagIds(selectedTagIds.filter(id => id !== tagId));
    } else {
      setSelectedTagIds([...selectedTagIds, tagId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      return;
    }

    const deck: CardDeck = {
      id: initialDeck?.id || generateId(),
      name: name.trim(),
      description: description.trim() || undefined,
      tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
      createdAt: initialDeck?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    onSubmit(deck);
    setName('');
    setDescription('');
    setSelectedTagIds([]);
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

      <div className="form-group">
        <label>Tags (Optional) - Click to select</label>
        {allTags.length === 0 ? (
          <p className="tags-empty">No tags available. Create tags in the tag manager.</p>
        ) : (
          <div className="tags-list">
            {allTags.map(tag => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={`tag-badge ${selectedTagIds.includes(tag.id) ? 'selected' : ''}`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        )}
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

