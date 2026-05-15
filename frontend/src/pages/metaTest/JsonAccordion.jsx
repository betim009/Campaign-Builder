export default function JsonAccordion({
  title = "Detalhes (JSON)",
  value,
  safeJson,
  defaultOpen = false,
}) {
  if (value == null) return null;

  return (
    <details open={Boolean(defaultOpen)} style={{ marginTop: 12 }}>
      <summary style={{ cursor: "pointer", fontWeight: 900 }}>
        {title}
      </summary>
      <pre
        style={{
          marginTop: 10,
          background: "#0b1220",
          color: "#e5e7eb",
          padding: 12,
          borderRadius: 12,
          overflowX: "auto",
          whiteSpace: "pre-wrap",
        }}
      >
{typeof safeJson === "function" ? safeJson(value) : JSON.stringify(value, null, 2)}
      </pre>
    </details>
  );
}

