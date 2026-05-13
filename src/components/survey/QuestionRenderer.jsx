import { scaleOptions } from '../../data/questions';
import styles from './QuestionRenderer.module.css';

function OptionButton({ selected, children, disabled, onClick }) {
  return (
    <button
      type="button"
      className={`${styles.option} ${selected ? styles.selected : ''}`}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
    >
      <span className={styles.optionMark}>{selected ? '✓' : ''}</span>
      <span>{children}</span>
    </button>
  );
}

export default function QuestionRenderer({ question, value, onChange, validationMessage }) {
  const renderChoices = (multi = false) => {
    const current = multi ? (Array.isArray(value) ? value : []) : value;
    const max = question.maxSelections;

    return (
      <div className={styles.options}>
        {question.options.map((option) => {
          const selected = multi ? current.includes(option) : current === option;
          const maxReached = multi && max && current.length >= max && !selected;

          return (
            <OptionButton
              key={option}
              selected={selected}
              disabled={maxReached}
              onClick={() => {
                if (!multi) {
                  onChange(option);
                  return;
                }
                const next = selected
                  ? current.filter((item) => item !== option)
                  : [...current, option].slice(0, max || undefined);
                onChange(next);
              }}
            >
              {option}
            </OptionButton>
          );
        })}
        {multi && max ? <p className={styles.optionHint}>최대 {max}개까지 선택할 수 있습니다.</p> : null}
      </div>
    );
  };

  return (
    <article className={styles.card}>
      <div className={styles.kicker}>
        <span>{question.section}</span>
        <strong>{question.id}</strong>
      </div>
      <h2 className={styles.title}>{question.question}</h2>
      {question.helpText ? <p className={styles.help}>{question.helpText}</p> : null}

      {question.type === 'scale5na' ? (
        <div className={styles.scaleGrid}>
          {scaleOptions.map((option) => (
            <OptionButton
              key={option.value}
              selected={value === option.value}
              onClick={() => onChange(option.value)}
            >
              <span className={option.isNeutral ? styles.neutralLabel : styles.scoreLabel}>
                {option.isNeutral ? 'N/A' : option.value}
              </span>
              <span>{option.label}</span>
            </OptionButton>
          ))}
        </div>
      ) : null}

      {question.type === 'singleChoice' ? renderChoices(false) : null}
      {question.type === 'multiChoice' ? renderChoices(true) : null}

      {question.type === 'longText' ? (
        <div className={styles.textAreaWrap}>
          <textarea
            className={styles.textArea}
            value={value || ''}
            onChange={(event) => onChange(event.target.value)}
            rows={8}
            placeholder="구체적으로 적어주세요. 개인 이름은 쓰지 않는 것을 권장합니다."
          />
          {question.required && question.minLength ? (
            <p className={styles.optionHint}>최소 {question.minLength}자 이상 입력해주세요.</p>
          ) : null}
        </div>
      ) : null}

      {validationMessage ? <p className={styles.error}>{validationMessage}</p> : null}
    </article>
  );
}
