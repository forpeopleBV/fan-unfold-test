interface ControlPanelProps {
  echoCount: number
  echoStartDelay: number
  echoGap: number
  onEchoCountChange: (value: number) => void
  onEchoStartDelayChange: (value: number) => void
  onEchoGapChange: (value: number) => void
  onClose: () => void
}

export function ControlPanel({
  echoCount,
  echoStartDelay,
  echoGap,
  onEchoCountChange,
  onEchoStartDelayChange,
  onEchoGapChange,
  onClose,
}: ControlPanelProps) {
  return (
    <aside className="control-panel" aria-label="Animation controls">
      <div className="control-panel__header">
        <div>
          <p className="control-panel__eyebrow">Motion controls</p>
          <h2>Echo settings</h2>
        </div>
        <button className="control-panel__close" type="button" onClick={onClose} aria-label="Close controls">
          ×
        </button>
      </div>

      <label className="control">
        <span>
          Echoes
          <output>{echoCount}</output>
        </span>
        <input
          type="range"
          min="0"
          max="40"
          step="1"
          value={echoCount}
          onChange={(event) => onEchoCountChange(Number(event.target.value))}
        />
      </label>

      <label className="control">
        <span>
          First echo delay
          <output>{echoStartDelay} ms</output>
        </span>
        <input
          type="range"
          min="20"
          max="240"
          step="10"
          value={echoStartDelay}
          onChange={(event) => onEchoStartDelayChange(Number(event.target.value))}
        />
      </label>

      <label className="control">
        <span>
          Delay between echoes
          <output>{echoGap} ms</output>
        </span>
        <input
          type="range"
          min="20"
          max="240"
          step="10"
          value={echoGap}
          onChange={(event) => onEchoGapChange(Number(event.target.value))}
        />
      </label>

      <p className="control-panel__hint">
        Press <kbd>C</kbd> or <kbd>Esc</kbd> to close
      </p>
    </aside>
  )
}
