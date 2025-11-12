import { useState, useEffect, useMemo } from 'react';
import { Card } from '../types/card';
import './PracticeMode.css';

interface PracticeModeProps {
  cards: Card[];
  onExit: () => void;
}

export default function PracticeMode({ cards, onExit }: PracticeModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Shuffle cards randomly on mount
  const shuffledCards = useMemo(() => {
    const shuffled = [...cards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, [cards]);

  const totalCards = shuffledCards.length;
  const safeIndex = Math.min(currentIndex, totalCards - 1);
  const currentCard = shuffledCards[safeIndex];

  useEffect(() => {
    setIsFlipped(false);
    if (currentIndex >= totalCards && totalCards > 0) {
      setCurrentIndex(totalCards - 1);
    }
  }, [currentIndex, totalCards]);

  const handleNext = () => {
    if (currentIndex < totalCards - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  if (totalCards === 0) {
    return (
      <div className="practice-mode-empty">
        <p>No cards available for practice.</p>
        <button onClick={onExit} className="btn btn-primary">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="practice-mode">
      <div className="practice-header">
        <button onClick={onExit} className="btn-exit">
          Exit Practice
        </button>
        <div className="practice-progress">
          {safeIndex + 1} / {totalCards}
        </div>
      </div>

      <div className="practice-card-container">
        <div 
          className={`practice-card ${isFlipped ? 'flipped' : ''}`}
          onClick={handleFlip}
        >
          <div className="practice-card-inner">
            <div className="practice-card-front">
              <div className="card-side-label">Question</div>
              <div className="card-content-text">
                {currentCard.front}
              </div>
              <div className="card-flip-hint">Tap to reveal answer</div>
            </div>
            <div className="practice-card-back">
              <div className="card-side-label">Answer</div>
              <div className="card-content-text">
                {currentCard.back}
              </div>
              <div className="card-flip-hint">Tap to see question</div>
            </div>
          </div>
        </div>
      </div>

      <div className="practice-controls">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="btn btn-secondary"
        >
          Previous
        </button>
        <button
          onClick={handleFlip}
          className="btn btn-primary"
        >
          {isFlipped ? 'Show Question' : 'Show Answer'}
        </button>
        <button
          onClick={handleNext}
          disabled={currentIndex >= totalCards - 1}
          className="btn btn-secondary"
        >
          Next
        </button>
      </div>
    </div>
  );
}

