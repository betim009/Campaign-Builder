import { useMemo, useState } from "react";

export default function CollapsibleCard({
  id,
  title,
  description,
  meta,
  defaultOpen = false,
  headerRight = null,
  children,
}) {
  const [open, setOpen] = useState(Boolean(defaultOpen));

  const summaryId = useMemo(() => {
    const base = String(id || "collapsible").replace(/[^a-z0-9_-]+/gi, "-").toLowerCase();
    return `${base}-summary`;
  }, [id]);

  return (
    <div
      id={id}
      className="card collapsibleCard"
      data-collapsible-card="1"
      style={{ padding: 0, marginTop: 16 }}
    >
      <details
        open={open}
        onToggle={(e) => {
          setOpen(Boolean(e.currentTarget.open));
        }}
      >
        <summary id={summaryId} className="collapsibleCardSummary">
          <div className="collapsibleCardSummaryLeft">
            <div className="collapsibleCardTitle">{title}</div>
            {description ? (
              <div className="muted collapsibleCardDescription">
                {description}
              </div>
            ) : null}
            {meta ? (
              <div className="muted collapsibleCardMeta">{meta}</div>
            ) : null}
          </div>

          <div
            className="collapsibleCardSummaryRight"
            onClick={(e) => {
              if (!headerRight) return;
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            {headerRight}
          </div>
        </summary>

        {children != null ? <div className="collapsibleCardBody">{children}</div> : null}
      </details>
    </div>
  );
}
