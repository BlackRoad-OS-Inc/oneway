<!-- BlackRoad SEO Enhanced -->

# oneway

> Part of **[BlackRoad OS](https://blackroad.io)** — Sovereign Computing for Everyone

[![BlackRoad OS](https://img.shields.io/badge/BlackRoad-OS-ff1d6c?style=for-the-badge)](https://blackroad.io)
[![BlackRoad-OS-Inc](https://img.shields.io/badge/Org-BlackRoad-OS-Inc-2979ff?style=for-the-badge)](https://github.com/BlackRoad-OS-Inc)

**oneway** is part of the **BlackRoad OS** ecosystem — a sovereign, distributed operating system built on edge computing, local AI, and mesh networking by **BlackRoad OS, Inc.**

### BlackRoad Ecosystem
| Org | Focus |
|---|---|
| [BlackRoad OS](https://github.com/BlackRoad-OS) | Core platform |
| [BlackRoad OS, Inc.](https://github.com/BlackRoad-OS-Inc) | Corporate |
| [BlackRoad AI](https://github.com/BlackRoad-AI) | AI/ML |
| [BlackRoad Hardware](https://github.com/BlackRoad-Hardware) | Edge hardware |
| [BlackRoad Security](https://github.com/BlackRoad-Security) | Cybersecurity |
| [BlackRoad Quantum](https://github.com/BlackRoad-Quantum) | Quantum computing |
| [BlackRoad Agents](https://github.com/BlackRoad-Agents) | AI agents |
| [BlackRoad Network](https://github.com/BlackRoad-Network) | Mesh networking |

**Website**: [blackroad.io](https://blackroad.io) | **Chat**: [chat.blackroad.io](https://chat.blackroad.io) | **Search**: [search.blackroad.io](https://search.blackroad.io)

---


> OneWay — Sovereign TLS edge and reverse proxy. BlackRoad fork of Caddy. Auto-HTTPS for 151 domains.

Part of the [BlackRoad OS](https://blackroad.io) ecosystem — [BlackRoad-OS-Inc](https://github.com/BlackRoad-OS-Inc)

---

# OneWay — BlackRoad Road Fleet

> **Sovereign TLS edge and reverse proxy.** Fork of [Caddy](https://github.com/caddyserver/caddy).

---

**OneWay** is BlackRoad's sovereign fork of Caddy — automatic HTTPS, reverse proxy, and edge routing for 151 domains from Gematria.

## What's Different

- **151 domains** — auto-TLS via Let's Encrypt for every BlackRoad domain
- **WireGuard routing** — Gematria edge → WireGuard tunnel → Pi fleet
- **Zero-config HTTPS** — automatic certificate provisioning and renewal
- **1,553 subdomains** — all proxied through OneWay on Gematria

## Deployment

```bash
# On Gematria (edge server)
caddy run --config /etc/caddy/Caddyfile
```

## Architecture

```
Internet → Gematria (OneWay/Caddy) → WireGuard → Pi Fleet
              ↓ TLS termination
              ↓ Auto Let's Encrypt
              ↓ Reverse proxy to nodes
```

## Key Routes

| Domain Pattern | Target |
|---------------|--------|
| `*.blackroad.io` | Various Pi services |
| `*.blackroadai.com` | AI inference nodes |
| `*.blackroad.network` | Infrastructure services |
| `git.blackroad.io` | Octavia :3100 (Gitea) |
| `roundtrip.blackroad.io` | Alice :8094 |

## Upstream

Forked from [caddyserver/caddy](https://github.com/caddyserver/caddy) (Apache 2.0 upstream).
All BlackRoad modifications are proprietary.

---

**BlackRoad OS, Inc.** — Pave Tomorrow.

*Proprietary. All rights reserved.*
