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
