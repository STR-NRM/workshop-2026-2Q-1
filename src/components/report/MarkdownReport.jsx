import { extractReportSignal } from './reportMarkdownUtils';

function renderInline(text, keyPrefix) {
  const parts = String(text || '').split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);
  return parts.map((part, index) => {
    const key = `${keyPrefix}-${index}`;
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={key}>{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

function tableCells(line) {
  return line
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());
}

function isTableSeparator(line) {
  return tableCells(line).every((cell) => /^:?-{3,}:?$/.test(cell));
}

function ReportHeroConclusion({ signal, styles }) {
  if (!signal) return null;
  return (
    <div className={styles.reportHeroConclusion}>
      <span>{signal.label}</span>
      <strong>“{signal.text}”</strong>
    </div>
  );
}

function ReportCallout({ signal, styles }) {
  const kindClass = {
    conclusion: styles.reportCalloutConclusion,
    summary: styles.reportCalloutSummary,
    suggestion: styles.reportCalloutSuggestion,
  }[signal.kind];

  return (
    <div className={`${styles.reportCallout} ${kindClass}`}>
      <span>{signal.label}</span>
      <strong>“{signal.text}”</strong>
    </div>
  );
}

function parseRoleMessageQuote(quote) {
  const normalized = String(quote || '').replace(/\s*\n\s*/g, ' ').trim();
  const match = normalized.match(/^\*\*([^*]+?)(?::)?\*\*\s*:?\s*["“]?([\s\S]*?)["”]?$/);
  if (!match) return null;
  const title = match[1].replace(/[:：]\s*$/, '').trim();
  const message = match[2].trim();
  if (!title.endsWith('께') || !message) return null;
  return { title, message };
}

function RoleMessageQuote({ title, message, quoteKey, styles }) {
  return (
    <div className={styles.roleMessageCard}>
      <div className={styles.roleMessageRecipient}>{renderInline(title, `${quoteKey}-title`)}</div>
      <p className={styles.roleMessageText}>{renderInline(message, `${quoteKey}-message`)}</p>
    </div>
  );
}

export default function MarkdownReport({ text, styles }) {
  const lines = String(text || '').split('\n');
  const nodes = [];
  let list = [];
  let table = [];
  let quoteBlock = [];
  const heroConclusion = lines.map(extractReportSignal).find((signal) => signal?.kind === 'conclusion');
  let skippedHeroConclusion = false;

  const flushList = () => {
    if (!list.length) return;
    nodes.push(
      <ul key={`list-${nodes.length}`} className={styles.reportList}>
        {list.map((item, index) => <li key={`${item}-${index}`}>{renderInline(item, `list-${nodes.length}-${index}`)}</li>)}
      </ul>,
    );
    list = [];
  };

  const flushQuote = () => {
    if (!quoteBlock.length) return;
    const quote = quoteBlock.join('\n').trim();
    const roleMessage = parseRoleMessageQuote(quote);
    if (roleMessage) {
      nodes.push(
        <RoleMessageQuote
          key={`role-quote-${nodes.length}`}
          quoteKey={`role-quote-${nodes.length}`}
          title={roleMessage.title}
          message={roleMessage.message}
          styles={styles}
        />,
      );
    } else if (quote) {
      nodes.push(
        <blockquote key={`quote-${nodes.length}`} className={styles.reportQuote}>
          {renderInline(quote, `quote-${nodes.length}`)}
        </blockquote>,
      );
    }
    quoteBlock = [];
  };

  const flushTable = () => {
    if (!table.length) return;
    const [header, ...rows] = table.filter((row) => !isTableSeparator(row));
    if (!header) {
      table = [];
      return;
    }
    const headerCells = tableCells(header);
    nodes.push(
      <div key={`table-${nodes.length}`} className={styles.reportTableWrap}>
        <table className={styles.reportTable}>
          <thead>
            <tr>
              {headerCells.map((cell, cellIndex) => (
                <th key={`${cell}-${cellIndex}`}>{renderInline(cell, `th-${cellIndex}`)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={`${row}-${rowIndex}`}>
                {tableCells(row).map((cell, cellIndex) => (
                  <td key={`${cell}-${cellIndex}`} data-label={headerCells[cellIndex] || ''}>
                    {renderInline(cell, `td-${rowIndex}-${cellIndex}`)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>,
    );
    table = [];
  };

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();
    if (!line) {
      flushList();
      flushTable();
      flushQuote();
      return;
    }
    if (line.startsWith('|') && line.endsWith('|')) {
      flushList();
      flushQuote();
      table.push(line);
      return;
    }
    flushTable();
    if (line.startsWith('>')) {
      flushList();
      const quote = line.replace(/^>\s?/, '').trim();
      if (quote) quoteBlock.push(quote);
      return;
    }
    flushQuote();
    const signal = extractReportSignal(line);
    if (signal) {
      flushList();
      if (signal.kind === 'conclusion' && !skippedHeroConclusion) {
        skippedHeroConclusion = true;
        return;
      }
      nodes.push(<ReportCallout key={`signal-${index}`} signal={signal} styles={styles} />);
      return;
    }
    if (line.startsWith('# ')) {
      flushList();
      nodes.push(<h2 key={index}>{line.replace(/^#\s*/, '')}</h2>);
      return;
    }
    if (line.startsWith('## ')) {
      flushList();
      nodes.push(<h3 key={index}>{line.replace(/^##\s*/, '')}</h3>);
      return;
    }
    if (line.startsWith('### ')) {
      flushList();
      nodes.push(<h4 key={index}>{line.replace(/^###\s*/, '')}</h4>);
      return;
    }
    if (/^[-*]\s+/.test(line)) {
      list.push(line.replace(/^[-*]\s+/, ''));
      return;
    }
    if (/^\d+\.\s+/.test(line)) {
      list.push(line.replace(/^\d+\.\s+/, ''));
      return;
    }
    flushList();
    nodes.push(<p key={index}>{renderInline(line, `p-${index}`)}</p>);
  });

  flushList();
  flushTable();
  flushQuote();
  return (
    <article className={styles.reportBody}>
      <ReportHeroConclusion signal={heroConclusion} styles={styles} />
      {nodes}
    </article>
  );
}
