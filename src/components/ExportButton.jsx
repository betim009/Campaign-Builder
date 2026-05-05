export default function ExportButton({ children }) {
  return (
    <button type="button" className="exportButton">
      <span aria-hidden="true">⬇</span> {children}
    </button>
  );
}

