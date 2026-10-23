// Abre um link curto do Google Maps (maps.app.goo.gl) e devolve o endereço completo.
// Não usa API do Google nem chave: só segue os redirecionamentos do próprio link.
const permitido = (h) => h === "maps.app.goo.gl" || h === "goo.gl" || /(^|\.)google\.[a-z.]+$/.test(h);

module.exports = async (req, res) => {
  let atual;
  try {
    atual = new URL(String(req.query.u || ""));
  } catch {
    return res.status(400).json({ erro: "link inválido" });
  }
  if (atual.protocol !== "https:" || !permitido(atual.hostname)) {
    return res.status(400).json({ erro: "não é um link do Google Maps" });
  }
  let url = atual.toString();
  try {
    for (let i = 0; i < 6; i++) {
      const r = await fetch(url, {
        redirect: "manual",
        headers: { "User-Agent": "Mozilla/5.0", "Accept-Language": "pt-BR,pt;q=0.9" },
      });
      const destino = r.headers.get("location");
      if (!destino) break;
      const prox = new URL(destino, url);
      if (prox.hostname.startsWith("consent.")) {
        const c = prox.searchParams.get("continue");
        if (c) url = c;
        break;
      }
      if (!permitido(prox.hostname)) break;
      url = prox.toString();
      if (url.includes("/maps/place/") || url.includes("/maps/search/")) break;
    }
  } catch {
    return res.status(502).json({ erro: "não foi possível abrir o link" });
  }
  res.setHeader("Cache-Control", "s-maxage=86400");
  return res.status(200).json({ url });
};
