import React, { useRef, useState } from 'react';
import { CardStorage } from '../services/storage';
import { Card, CardDeck } from '../types/card';
import { Tag } from '../types/tag';
import { generateId } from '../utils/id';
import './ImportExport.css';

interface ImportExportProps {
  onClose: () => void;
  onImported?: () => void; // optional callback to reload data
}

function cardsToJSON(cards: Card[]) {
  return JSON.stringify(cards, null, 2);
}

function cardsToCSV(cards: Card[]) {
  const headers = ['id','front','back','deckId','createdAt','updatedAt','difficulty','lastReviewed','reviewCount'];
  const escape = (v: any) => {
    if (v === undefined || v === null) return '';
    const s = String(v);
    if (s.includes(',') || s.includes('\n') || s.includes('"')) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };

  const rows = cards.map(c => headers.map(h => escape((c as any)[h])).join(','));
  return [headers.join(','), ...rows].join('\n');
}

function parseCSV(input: string): Card[] {
  const lines = input.split(/\r?\n/).filter(l => l.trim() !== '');
  if (lines.length === 0) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows = lines.slice(1);
  const cards: Card[] = [];

  for (const row of rows) {
    // simple CSV parser that handles quoted fields
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < row.length; i++) {
      const ch = row[i];
      if (ch === '"') {
        if (inQuotes && row[i+1] === '"') {
          current += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
    values.push(current);

    const obj: any = {};
    headers.forEach((h, idx) => {
      obj[h] = values[idx] !== undefined ? values[idx] : '';
    });

    // map fields to Card types
    const card: Card = {
      id: obj.id && obj.id.trim() ? obj.id.trim() : generateId(),
      front: obj.front || '',
      back: obj.back || '',
      deckId: obj.deckId || '',
      createdAt: obj.createdAt ? Number(obj.createdAt) : Date.now(),
      updatedAt: obj.updatedAt ? Number(obj.updatedAt) : Date.now(),
      difficulty: obj.difficulty ? Number(obj.difficulty) : 0,
      lastReviewed: obj.lastReviewed ? Number(obj.lastReviewed) : undefined,
      reviewCount: obj.reviewCount ? Number(obj.reviewCount) : 0,
    };

    cards.push(card);
  }

  return cards;
}

export default function ImportExport({ onClose, onImported }: ImportExportProps) {
  const [selectedFormat, setSelectedFormat] = useState<'json'|'csv'>('json');
  const [includeAll, setIncludeAll] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [pasteText, setPasteText] = useState('');

  const handleExport = async () => {
    setStatus('Preparing export...');
    const cards = await CardStorage.getAllCards();
    if (selectedFormat === 'json') {
      if (includeAll) {
        // export cards, decks and tags as an object
        const decks = await CardStorage.getAllDecks();
        const tags = await CardStorage.getAllTags();
        const payload = { cards, decks, tags };
        const data = JSON.stringify(payload, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cards-decks-tags-export.json';
        a.click();
        URL.revokeObjectURL(url);
        setStatus('Exported JSON (cards + decks + tags)');
      } else {
        const data = cardsToJSON(cards);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cards-export.json';
        a.click();
        URL.revokeObjectURL(url);
        setStatus('Exported JSON');
      }
    } else {
      const data = cardsToCSV(cards);
      const blob = new Blob([data], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cards-export.csv';
      a.click();
      URL.revokeObjectURL(url);
      setStatus('Exported CSV');
    }
    setTimeout(() => setStatus(''), 2000);
  };

  const processImportedCards = async (cards: Card[]) => {
    setStatus('Importing cards...');
    for (const c of cards) {
      // ensure id and timestamps
      const card: Card = {
        id: c.id || generateId(),
        front: c.front || '',
        back: c.back || '',
        deckId: c.deckId || '',
        createdAt: c.createdAt || Date.now(),
        updatedAt: Date.now(),
        difficulty: c.difficulty || 0,
        lastReviewed: c.lastReviewed,
        reviewCount: c.reviewCount || 0,
      };
      await CardStorage.saveCard(card);
    }
    setStatus(`Imported ${cards.length} card${cards.length !== 1 ? 's' : ''}`);
    if (onImported) onImported();
    setTimeout(() => setStatus(''), 2000);
  };

  const processImportedDecks = async (decks: CardDeck[]) => {
    setStatus('Importing decks...');
    for (const d of decks) {
      await CardStorage.saveDeck(d);
    }
  };

  const processImportedTags = async (tags: Tag[]) => {
    setStatus('Importing tags...');
    for (const t of tags) {
      await CardStorage.saveTag(t);
    }
  };

  const handleFile = async (file: File | null) => {
    if (!file) return;
    const text = await file.text();
    try {
      if (file.name.toLowerCase().endsWith('.json') || (text.trim().startsWith('{') || text.trim().startsWith('['))) {
        const parsed = JSON.parse(text);
        // support exported object with cards/decks/tags
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && (parsed.cards || parsed.decks || parsed.tags)) {
          if (parsed.tags && Array.isArray(parsed.tags)) {
            await processImportedTags(parsed.tags as Tag[]);
          }
          if (parsed.decks && Array.isArray(parsed.decks)) {
            await processImportedDecks(parsed.decks as CardDeck[]);
          }
          if (parsed.cards && Array.isArray(parsed.cards)) {
            await processImportedCards(parsed.cards as Card[]);
          }
        } else {
          const cards: Card[] = Array.isArray(parsed) ? parsed : [parsed];
          await processImportedCards(cards);
        }
      } else {
        // treat as CSV
        const cards = parseCSV(text);
        await processImportedCards(cards);
      }
    } catch (err) {
      console.error(err);
      setStatus('Failed to parse file');
      setTimeout(() => setStatus(''), 3000);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    await handleFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePasteImport = async () => {
    const txt = pasteText.trim();
    if (!txt) return;
    try {
      if (txt.startsWith('{') || txt.startsWith('[')) {
        const parsed = JSON.parse(txt);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && (parsed.cards || parsed.decks || parsed.tags)) {
          if (parsed.tags && Array.isArray(parsed.tags)) {
            await processImportedTags(parsed.tags as Tag[]);
          }
          if (parsed.decks && Array.isArray(parsed.decks)) {
            await processImportedDecks(parsed.decks as CardDeck[]);
          }
          if (parsed.cards && Array.isArray(parsed.cards)) {
            await processImportedCards(parsed.cards as Card[]);
          }
        } else {
          const cards: Card[] = Array.isArray(parsed) ? parsed : [parsed];
          await processImportedCards(cards);
        }
      } else {
        const cards = parseCSV(txt);
        await processImportedCards(cards);
      }
      setPasteText('');
    } catch (err) {
      console.error(err);
      setStatus('Failed to parse pasted content');
      setTimeout(() => setStatus(''), 3000);
    }
  };

  return (
    <div className="import-export-container">
      <div className="import-export-header">
        <h2>Import / Export Cards</h2>
        <button onClick={onClose} className="btn-close-browse">✕</button>
      </div>

      <div className="import-export-body">
        <section className="export-section">
          <h3>Export</h3>
          <div className="export-controls">
            <label>
              <input type="radio" name="format" checked={selectedFormat === 'json'} onChange={() => setSelectedFormat('json')} /> JSON
            </label>
            <label>
              <input type="radio" name="format" checked={selectedFormat === 'csv'} onChange={() => setSelectedFormat('csv')} /> CSV
            </label>
            {selectedFormat === 'json' && (
              <label style={{ marginLeft: 8 }}>
                <input type="checkbox" checked={includeAll} onChange={e => setIncludeAll(e.target.checked)} /> Include decks & tags
              </label>
            )}
            <button className="btn btn-primary" onClick={handleExport}>Export</button>
          </div>
        </section>

        <section className="import-section">
          <h3>Import from file</h3>
          <input ref={fileInputRef} type="file" accept=".json,.csv,text/*" onChange={handleFileInput} />
          <p className="import-hint">You can import a JSON array of cards or a CSV with headers (id,front,back,deckId,createdAt,...). To restore decks and tags as well, import a JSON object with keys `cards`, `decks`, and `tags` (exportable via "Include decks & tags").</p>
        </section>

        <section className="paste-section">
          <h3>Paste content</h3>
          <textarea value={pasteText} onChange={e => setPasteText(e.target.value)} placeholder="Paste JSON array or CSV here" />
          <div className="paste-actions">
            <button className="btn btn-primary" onClick={handlePasteImport}>Import Pasted</button>
            <button className="btn" onClick={() => setPasteText('')}>Clear</button>
          </div>
        </section>

        {status && (
          <div className="import-status">{status}</div>
        )}
      </div>
    </div>
  );
}
