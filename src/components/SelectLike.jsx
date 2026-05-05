export default function SelectLike({ label, value }) {
  return (
    <div>
      <div className="fieldLabel">{label}</div>
      <div className="selectLike" role="button" aria-label={label}>
        <span>{value}</span>
        <span aria-hidden="true" style={{ opacity: 0.6 }}>
          ▾
        </span>
      </div>
    </div>
  );
}

