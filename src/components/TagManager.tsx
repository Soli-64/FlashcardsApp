import { useState, useEffect } from 'react';
import { Tag } from '../types/tag';
import { CardStorage } from '../services/storage';
import { generateId } from '../utils/id';
import './TagManager.css';

interface TagManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const COLORS = ['#646cff', '#74ffb3', '#ff6464', '#ffb364', '#64b3ff', '#b364ff'];

export default function TagManager({ isOpen, onClose }: TagManagerProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(COLORS[0]);

  useEffect(() => {
    if (isOpen) {
      loadTags();
    }
  }, [isOpen]);

  const loadTags = async () => {
    const loadedTags = await CardStorage.getAllTags();
    setTags(loadedTags);
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    const tagName = newTagName.trim().toLowerCase();
    const exists = tags.some(t => t.name.toLowerCase() === tagName);
    
    if (exists) {
      return;
    }

    const newTag: Tag = {
      id: generateId(),
      name: tagName,
      createdAt: Date.now(),
      color: newTagColor
    };

    await CardStorage.saveTag(newTag);
    setNewTagName('');
    setNewTagColor(COLORS[0]);
    await loadTags();
  };

  const handleDeleteTag = async (tagId: string) => {
    await CardStorage.deleteTag(tagId);
    await loadTags();
  };

  if (!isOpen) return null;

  return (
    <div className="tag-manager-overlay" onClick={onClose}>
      <div className="tag-manager-content" onClick={(e) => e.stopPropagation()}>
        <div className="tag-manager-header">
          <h2>Manage Tags</h2>
          <button onClick={onClose} className="tag-manager-close" aria-label="Close">
            ×
          </button>
        </div>

        <div className="tag-manager-body">
          <form onSubmit={handleCreateTag} className="tag-manager-form">
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="TAG name"
              className="tag-manager-input"
            />
            <button type="submit" className="btn" style={{ backgroundColor: newTagColor }}>
              <strong>+</strong>
            </button>
            
          </form>

          <div className="tag-manager-color-picker">
            {
              COLORS.map((color, index) => (
                <div key={index} className={`tag-manager-color-picker-item ${newTagColor === color ? 'tag-manager-color-picker-item-active' : ''}`} style={{ backgroundColor: color }} onClick={() => setNewTagColor(color)}></div>
              ))
            }
          </div>

          <div className="tag-manager-list">
            {tags.length === 0 ? (
              <p className="tag-manager-empty">No tags yet. Create your first tag!</p>
            ) : (
              tags.map(tag => (
                <div key={tag.id} className="tag-manager-item">
                  <span 
                  className="tag-badge-display"
                  style={{ backgroundColor: tag.color }}
                  >{tag.name}</span>
                  <button
                    onClick={() => handleDeleteTag(tag.id)}
                    className="tag-manager-delete"
                    aria-label={`Delete tag ${tag.name}`}
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
