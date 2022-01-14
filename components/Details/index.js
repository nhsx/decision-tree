export function Summary({ children }) {
  return (
    <summary className="nhsuk-details__summary">
      <span className="nhsuk-details__summary-text">{children}</span>
    </summary>
  )
}

export function Details({ summary, children }) {
  return (
    <details className="nhsuk-details">
      <Summary>{summary}</Summary>
      <div className="nhsuk-details__text">
        {children}
      </div>
    </details>
  )
}
