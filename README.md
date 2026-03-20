# OneWay — BlackRoad Road Fleet

**Proprietary Software — BlackRoad OS, Inc.**

## What is OneWay?

OneWay is BlackRoad's sovereign TLS edge and reverse proxy solution, forked from Caddy. It runs on BlackRoad hardware as part of the Road Fleet — our self-hosted infrastructure stack that eliminates cloud dependency.

## Why OneWay?

Cloud proxy services can cache-poison your content, inject tracking headers, revoke your TLS for political reasons, or rate-limit your traffic during spikes. OneWay gives us complete control over our TLS termination, certificate management, and reverse proxy routing — running on Gematria with Let's Encrypt auto-renewal and zero external dependency.

## Part of the Road Fleet

| Road Name | Upstream | Purpose |
|-----------|----------|---------|
| RoadCode | Gitea | Git hosting |
| **OneWay** | **Caddy** | **TLS edge & reverse proxy** |
| TollBooth | WireGuard | Encrypted mesh VPN |
| PitStop | Pi-hole | DNS filtering |
| Passenger | Ollama | Local AI inference |
| RearView | Qdrant | Vector database |
| Curb | MinIO | Object storage |
| RoundAbout | Headscale | Mesh coordination |
| CarPool | NATS | Pub/sub messaging |
| OverPass | n8n | Workflow automation |
| BackRoad | Portainer | Container management |
| GuardRail | (custom) | AI safety guardrails |

## License

This software is proprietary to BlackRoad OS, Inc. See [LICENSE](LICENSE) for full terms.

Public code is not open source. You may view and learn from this code. Commercial use, forking, and redistribution are prohibited.

---

**BlackRoad OS — Pave Tomorrow.**

*Copyright 2024-2026 BlackRoad OS, Inc. All Rights Reserved.*
