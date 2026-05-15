export default function SectionDivider({ id, title, subtitle, tone = "default" }) {
  return (
    <div id={id} className={`metaSectionDivider metaSectionDividerTone-${tone}`}>
      <div className="metaSectionDividerTitle">{title}</div>
      {subtitle ? <div className="muted metaSectionDividerSubtitle">{subtitle}</div> : null}
    </div>
  );
}

