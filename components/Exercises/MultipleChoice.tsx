'use client';

import { Button } from '@/components';
import './multipleChoice.css';

interface MultipleChoiceProps {
  question: string;
  options: string[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  disabled: boolean;
  correctIndex?: number; // Show after submission
  showResult?: boolean;
}

export default function MultipleChoice({
  question,
  options,
  selectedIndex,
  onSelect,
  disabled,
  correctIndex,
  showResult = false
}: MultipleChoiceProps) {
  const labels = ['A', 'B', 'C', 'D'];

  const getOptionClass = (index: number) => {
    const baseClass = 'mc-option';
    const classes = [baseClass];

    if (selectedIndex === index) {
      classes.push('selected');
    }

    if (showResult && correctIndex !== undefined) {
      if (index === correctIndex) {
        classes.push('correct');
      } else if (index === selectedIndex && index !== correctIndex) {
        classes.push('incorrect');
      }
    }

    if (disabled) {
      classes.push('disabled');
    }

    return classes.join(' ');
  };

  return (
    <div className="multiple-choice-container">
      <div className="mc-question">
        <h3>{question}</h3>
      </div>
      <div className="mc-options">
        {options.map((option, index) => (
          <Button
            key={index}
            variant="secondary"
            className={getOptionClass(index)}
            onClick={() => !disabled && onSelect(index)}
            disabled={disabled}
            sx={{
              width: '100%',
              justifyContent: 'flex-start',
              textAlign: 'left',
              textTransform: 'none',
            }}
          >
            <span className="mc-label">{labels[index]}</span>
            <span className="mc-text">{option}</span>
            {showResult && index === correctIndex && (
              <span className="mc-icon">✓</span>
            )}
            {showResult && index === selectedIndex && index !== correctIndex && (
              <span className="mc-icon">✗</span>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
}
