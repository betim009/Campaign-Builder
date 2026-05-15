import JsonAccordion from "./JsonAccordion.jsx";

export default function StepAdSection({
  createdMetaAdSetId,
  adName,
  setAdName,
  adCreativeId,
  setAdCreativeId,
  creativeDraftId,
  setCreativeDraftId,
  creativeDraftOptions,
  metaAdAccountId,
  metaPageId,
  setMetaPageId,
  metaInstagramActorId,
  setMetaInstagramActorId,
  backendHasPageId,
  backendHasInstagramActorId,
  creativePublishForce,
  setCreativePublishForce,
  selectedCreativeDraftMetaCreativeId,
  selectedCreativeDraftMetaCreativeIdIsReal,
  canPublishCreative,
  creativeDraftHasUrl,
  creativePublishing,
  onPublishCreative,
  canFetchCreative,
  creativeGetLoading,
  creativeGetResult,
  onFetchCreative,
  pagesLoading,
  pagesResult,
  pagesError,
  pagesErrorDetails,
  onListPages,
  canCreateAd,
  adCreating,
  onCreateAd,
  createdGeneratedCampaignId,
  flowMode,
  normalizeNonEmptyString,
}) {
  const candidates = (() => {
    const list = [];

    const myPages = Array.isArray(pagesResult?.myPages) ? pagesResult.myPages : [];
    const promotePages = Array.isArray(pagesResult?.promotePages) ? pagesResult.promotePages : [];
    const ownedPagesByBusiness = Array.isArray(pagesResult?.ownedPagesByBusiness) ? pagesResult.ownedPagesByBusiness : [];

    for (const p of myPages) list.push({ id: p?.id ?? null, name: p?.name ?? null, source: "me/accounts" });
    for (const p of promotePages) list.push({ id: p?.id ?? null, name: p?.name ?? null, source: "act/promote_pages" });
    for (const b of ownedPagesByBusiness) {
      const pages = Array.isArray(b?.pages) ? b.pages : [];
      for (const p of pages) {
        list.push({ id: p?.id ?? null, name: p?.name ?? null, source: `business:${b?.business_id ?? "—"}` });
      }
    }

    const seen = new Set();
    return list
      .filter((p) => typeof p.id === "string" && p.id.trim())
      .filter((p) => {
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      });
  })();

  return (
    <div id="meta-test-step-ad" className="card" style={{ padding: 18, marginTop: 16 }}>
      <div style={{ fontWeight: 900, fontSize: 16 }}>Etapa 3 — Ad (PAUSED)</div>
      <div className="muted" style={{ marginTop: 8, fontWeight: 800, lineHeight: 1.55 }}>
        Criação incremental via `POST /api/meta/ads` (REAL/STUB). Sempre PAUSED. REAL requer `creativeId` existente.
      </div>

      <div
        style={{
          marginTop: 14,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 12,
        }}
      >
        <label style={{ display: "grid", gap: 6 }}>
          <span className="muted" style={{ fontWeight: 900 }}>
            Meta AdSet ID (origem)
          </span>
          <input
            value={createdMetaAdSetId}
            readOnly
            placeholder="Será preenchido quando AdSet existir"
            style={{
              height: 38,
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              padding: "0 12px",
              fontSize: 13,
              fontWeight: 800,
              outline: "none",
              background: "#f9fafb",
            }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span className="muted" style={{ fontWeight: 900 }}>
            Nome do Ad
          </span>
          <input
            value={adName}
            onChange={(e) => setAdName(e.target.value)}
            placeholder="Ex: Ad BR — Image 1"
            style={{
              height: 38,
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              padding: "0 12px",
              fontSize: 13,
              fontWeight: 700,
              outline: "none",
              background: "#ffffff",
            }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span className="muted" style={{ fontWeight: 900 }}>
            Creative ID (somente REAL)
          </span>
          <input
            value={adCreativeId}
            onChange={(e) => setAdCreativeId(e.target.value)}
            placeholder="Ex: 1234567890"
            disabled={flowMode === "STUB"}
            style={{
              height: 38,
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              padding: "0 12px",
              fontSize: 13,
              fontWeight: 700,
              outline: "none",
              background: flowMode === "STUB" ? "#f9fafb" : "#ffffff",
            }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span className="muted" style={{ fontWeight: 900 }}>
            Creative draft (local)
          </span>
          <select
            value={creativeDraftId || ""}
            onChange={(e) => setCreativeDraftId(e.target.value)}
            disabled={!creativeDraftOptions?.length}
            style={{
              height: 38,
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              padding: "0 12px",
              fontSize: 13,
              fontWeight: 800,
              outline: "none",
              background: "#ffffff",
            }}
          >
            <option value="">(nenhum)</option>
            {(creativeDraftOptions ?? []).map((d) => (
              <option key={d.id} value={d.id}>
                {(d.headline || d.primary_text || d.id).slice(0, 60)}
              </option>
            ))}
          </select>
          <div className="muted" style={{ fontWeight: 800 }}>
            Persistido no DB; útil para rastreabilidade e futura criação de Creative REAL.
          </div>
        </label>
      </div>

      <div className="card" style={{ padding: 14, marginTop: 12 }}>
        <div style={{ fontWeight: 900 }}>Creative REAL (a partir do draft)</div>
        <div className="muted" style={{ marginTop: 6, fontWeight: 800, lineHeight: 1.55 }}>
          Publica um AdCreative na Meta via backend (token no backend). Se vazio, usa `META_PAGE_ID` / `META_INSTAGRAM_ACTOR_ID`.
        </div>

        <div
          style={{
            marginTop: 12,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 12,
          }}
        >
          <label style={{ display: "grid", gap: 6 }}>
            <span className="muted" style={{ fontWeight: 900 }}>Page ID</span>
            <input
              value={metaPageId}
              onChange={(e) => setMetaPageId(e.target.value)}
              placeholder="Opcional (env: META_PAGE_ID)"
              disabled={flowMode === "STUB"}
              style={{
                height: 38,
                borderRadius: 12,
                border: "1px solid #e5e7eb",
                padding: "0 12px",
                fontSize: 13,
                fontWeight: 700,
                outline: "none",
                background: flowMode === "STUB" ? "#f9fafb" : "#ffffff",
              }}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span className="muted" style={{ fontWeight: 900 }}>Instagram Actor ID</span>
            <input
              value={metaInstagramActorId}
              onChange={(e) => setMetaInstagramActorId(e.target.value)}
              placeholder="Opcional (env: META_INSTAGRAM_ACTOR_ID)"
              disabled={flowMode === "STUB"}
              style={{
                height: 38,
                borderRadius: 12,
                border: "1px solid #e5e7eb",
                padding: "0 12px",
                fontSize: 13,
                fontWeight: 700,
                outline: "none",
                background: flowMode === "STUB" ? "#f9fafb" : "#ffffff",
              }}
            />
          </label>
        </div>

        <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <button type="button" className="pillOutline" disabled={!canPublishCreative} onClick={onPublishCreative}>
            {creativePublishing ? "Publicando..." : "Publicar Creative REAL"}
          </button>
          <button type="button" className="pillOutline" disabled={!canFetchCreative} onClick={onFetchCreative}>
            {creativeGetLoading ? "Consultando..." : "Consultar Creative (Graph)"}
          </button>
          <button
            type="button"
            className="pillOutline"
            disabled={flowMode === "STUB" || pagesLoading}
            onClick={onListPages}
          >
            {pagesLoading ? "Listando..." : "Listar Pages (Graph)"}
          </button>
          <div className="muted" style={{ fontWeight: 800 }}>
            Requer modo REAL + token no backend + `creativeDraftId` com `destinationUrl`.
          </div>
        </div>

        <div className="muted" style={{ marginTop: 10, fontWeight: 900 }}>
          Page ID:{" "}
          {normalizeNonEmptyString(metaPageId)
            ? "UI"
            : backendHasPageId
            ? "env (META_PAGE_ID)"
            : "AUSENTE (preencha no UI ou no env)"}
          {" · "}
          Instagram Actor ID:{" "}
          {normalizeNonEmptyString(metaInstagramActorId)
            ? "UI"
            : backendHasInstagramActorId
            ? "env (META_INSTAGRAM_ACTOR_ID)"
            : "— (opcional)"}
        </div>

        {pagesError ? (
          <div className="muted" style={{ marginTop: 10, fontWeight: 900, color: "#991b1b" }}>
            Falha ao listar Pages: {pagesError}
            <JsonAccordion title="Detalhes (erro Pages)" value={pagesErrorDetails} />
          </div>
        ) : null}

        {pagesResult ? (
          <>
            <div className="muted" style={{ marginTop: 10, fontWeight: 800 }}>
              Se vazio, o token provavelmente não tem acesso a uma Page. Você ainda pode informar `pageId` manualmente.
            </div>
            {candidates.length ? (
              <div className="card" style={{ padding: 12, marginTop: 10 }}>
                <div className="muted" style={{ fontWeight: 900 }}>Sugestões de Page ID</div>
                <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                  {candidates.slice(0, 8).map((p) => (
                    <div
                      key={p.id}
                      style={{ display: "flex", gap: 10, alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap" }}
                    >
                      <div style={{ fontWeight: 900 }}>
                        {p.name || "—"} <span className="muted" style={{ fontWeight: 800 }}>({p.id})</span>
                        <div className="muted" style={{ marginTop: 4, fontWeight: 800 }}>Fonte: {p.source}</div>
                      </div>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <button
                          type="button"
                          className="pillOutline"
                          onClick={() => setMetaPageId(String(p.id))}
                          disabled={flowMode === "STUB"}
                          style={{ height: 32, padding: "0 12px", fontSize: 12, fontWeight: 900 }}
                        >
                          Usar pageId
                        </button>
                        <button
                          type="button"
                          className="pillOutline"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(String(p.id));
                            } catch {
                              // ignore
                            }
                          }}
                          style={{ height: 32, padding: "0 12px", fontSize: 12, fontWeight: 900 }}
                        >
                          Copiar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {candidates.length > 8 ? (
                  <div className="muted" style={{ marginTop: 8, fontWeight: 800 }}>
                    +{candidates.length - 8} Page(s) ocultas…
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="muted" style={{ marginTop: 10, fontWeight: 900, color: "#991b1b" }}>
                Nenhuma Page encontrada via Graph nas fontes atuais (`me/accounts`, `act_*/promote_pages`, `owned_pages`).
              </div>
            )}
            <JsonAccordion
              title={`Pages (Graph) — metaAdAccountId: ${metaAdAccountId || "—"}`}
              value={pagesResult}
            />
          </>
        ) : null}

        <label style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10, userSelect: "none" }}>
          <input
            type="checkbox"
            checked={creativePublishForce === true}
            onChange={(e) => setCreativePublishForce(e.target.checked)}
            disabled={flowMode === "STUB"}
          />
          <span className="muted" style={{ fontWeight: 900 }}>
            Force republish (sobrescreve `meta_creative_id` existente no draft)
          </span>
        </label>

        {creativeDraftId && !creativeDraftHasUrl ? (
          <div className="muted" style={{ marginTop: 8, fontWeight: 900, color: "#991b1b" }}>
            Draft selecionado sem `destinationUrl` — publique só depois de preencher a URL no draft.
          </div>
        ) : null}
        {selectedCreativeDraftMetaCreativeId && selectedCreativeDraftMetaCreativeIdIsReal && !creativePublishForce ? (
          <div className="muted" style={{ marginTop: 8, fontWeight: 900, color: "#991b1b" }}>
            Draft já possui `meta_creative_id`: <b>{selectedCreativeDraftMetaCreativeId}</b>. Marque{" "}
            <b>Force republish</b> para publicar novamente.
          </div>
        ) : null}
        {flowMode === "REAL" &&
        creativeDraftId &&
        !normalizeNonEmptyString(metaPageId) &&
        !backendHasPageId ? (
          <div className="muted" style={{ marginTop: 8, fontWeight: 900, color: "#991b1b" }}>
            Faltando <b>Page ID</b> (obrigatório) — preencha acima ou configure <b>META_PAGE_ID</b> no backend.
          </div>
        ) : null}

        <JsonAccordion title="Evidência: Creative (Graph)" value={creativeGetResult} />
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <button type="button" className="pillOutline" disabled={!canCreateAd} onClick={onCreateAd}>
          {adCreating ? "Criando..." : `Criar Ad ${flowMode} (PAUSED)`}
        </button>
        <div className="muted" style={{ fontWeight: 800 }}>
          Requer AdSet criado acima. REAL exige token no backend e `creativeId`.
        </div>
      </div>

      <JsonAccordion
        title="Preview do payload"
        value={{
          generatedCampaignId: createdGeneratedCampaignId || null,
          name: normalizeNonEmptyString(adName) || null,
          creativeId: flowMode === "REAL" ? normalizeNonEmptyString(adCreativeId) || null : undefined,
          creativeDraftId: normalizeNonEmptyString(creativeDraftId) || null,
          mode: flowMode,
        }}
      />
    </div>
  );
}
