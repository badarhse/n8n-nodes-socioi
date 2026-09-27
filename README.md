# n8n-nodes-socioi

Community node for [Socioi](https://socioi.com) — schedule and publish social posts from n8n using the [Socioi Public API](https://socioi.com/docs/public-api/introduction).

This package is a thin, MIT-licensed wrapper around Socioi’s public HTTP API. The Socioi product itself is proprietary.

## Installation

### Community Nodes (recommended)

1. Open your n8n instance → **Settings** → **Community Nodes**
2. Click **Install**
3. Enter `n8n-nodes-socioi`
4. Confirm and restart if prompted

### Manual (self-hosted)

```bash
npm install n8n-nodes-socioi
```

Then restart n8n.

## Credentials

1. Sign in to [socioi.com](https://socioi.com) → **Settings → Developers → Access**
2. Create an API key (`si_live_…`)
3. In n8n, add **Socioi API** credentials:
   - **API Key**: your `si_live_…` key
   - **Host**: `https://socioi.com/api` (default)

Credential test calls `GET /public/v1/is-connected`.

## Operations

| Resource | Operations |
|----------|------------|
| **Channel** | Get Many, Get Quota |
| **Post** | Create (draft / schedule / now), Get, Get Many, Delete, Schedule |
| **Media** | Get Many, Upload From URL, Delete |

### Example: schedule a post

1. **Media → Upload From URL** with an image URL → note the returned media `id`
2. **Channel → Get Many** → copy channel `id`s
3. **Post → Create**
   - Type: `Schedule`
   - Content: your caption
   - Channel IDs: comma-separated IDs
   - Date: UTC datetime
   - Media IDs: optional media id(s)

## Docs

- [Public API introduction](https://socioi.com/docs/public-api/introduction)
- [Authentication](https://socioi.com/docs/public-api/authentication)
- [Posts](https://socioi.com/docs/public-api/posts)

## Development

```bash
npm install
npm run build
npm run lint
```

## License

[MIT](./LICENSE.md)
