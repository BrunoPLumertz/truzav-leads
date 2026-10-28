// Verifica o site de um negócio: se abre, se tem erro de segurança, cadeado e botão de WhatsApp.
// Só acessa endereços públicos (bloqueia redes internas) e lê no máximo 300 KB da página.
const dns = require("dns").promises;
const net = require("net");

const privado = (ip) => {
  if (net.isIPv6(ip)) return ip === "::1" || /^f[cd]/i.test(ip) || /^fe80/i.test(ip) || ip.startsWith("::ffff:") && privado(ip.slice(7));
  const p = ip.split(".").map(Number);
  return p[0] === 10 || p[0] === 127 || p[0] === 0 || (p[0] === 169 && p[1] === 254) || (p[0] === 172 && p[1] >= 16 && p[1] <= 31) || (p[0] === 192 && p[1] === 168) || (p[0] === 100 && p[1] >= 64 && p[1] <= 127);
};

async function hostSeguro(host) {
  if (net.isIP(host)) return !privado(host);
  const lista = await dns.lookup(host, { all: true });
  return lista.length > 0 && lista.every((a) => !privado(a.address));
}

module.exports = async (req, res) => {
  let url;
  try {
    url = new URL(String(req.query.u || ""));
  } catch {
    return res.status(400).json({ erro: "link inválido" });
  }
  if (!/^https?:$/.test(url.protocol)) return res.status(400).json({ erro: "link inválido" });

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 9000);
  try {
    let atual = url.toString();
    let r;
    for (let i = 0; i < 5; i++) {
      const h = new URL(atual).hostname;
      let ok;
      try {
        ok = await hostSeguro(h);
      } catch {
        return res.status(200).json({ estado: "fora", motivo: "endereço não encontrado" });
      }
      if (!ok) return res.status(400).json({ erro: "endereço não permitido" });
      r = await fetch(atual, { redirect: "manual", signal: ctrl.signal, headers: { "User-Agent": "Mozilla/5.0 (TRUZAV verificador)", "Accept-Language": "pt-BR" } });
      const loc = r.headers.get("location");
      if (r.status >= 300 && r.status < 400 && loc) { atual = new URL(loc, atual).toString(); continue; }
      break;
    }
    const corpo = await r.text();
    const html = corpo.slice(0, 300000);
    const titulo = ((html.match(/<title[^>]*>([^<]*)/i) || [])[1] || "").trim().slice(0, 140);
    return res.status(200).json({
      estado: r.ok ? "ok" : "erro",
      status: r.status,
      final: atual,
      https: atual.startsWith("https:"),
      titulo,
      whatsapp: /wa\.me\/|api\.whatsapp\.com|whatsapp\.com\/send|web\.whatsapp/i.test(html),
      celular: /<meta[^>]+name=["']?viewport/i.test(html),
    });
  } catch (e) {
    const code = String((e.cause && (e.cause.code || e.cause.message)) || e.code || "");
    if (e.name === "AbortError") return res.status(200).json({ estado: "lento" });
    if (/CERT|SSL|TLS|SELF_SIGNED|ALTNAME|UNABLE_TO_VERIFY/i.test(code)) return res.status(200).json({ estado: "ssl", motivo: code });
    if (/ENOTFOUND|EAI_AGAIN|ENODATA/i.test(code)) return res.status(200).json({ estado: "fora", motivo: "endereço não encontrado" });
    return res.status(200).json({ estado: "fora", motivo: code || "erro ao abrir" });
  } finally {
    clearTimeout(timer);
  }
};
