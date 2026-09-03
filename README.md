# codecritic

## structure

There are three environments: dev, preview and remote. dev and preview use `wrangler` to provide a cf/d1 platform context, and `remote` gets deployed on cloudflare pages.

Because this is not a durable project, migrations are not included in the repo.

### setup

```bash
pnpm install
pnpm prepare
pnpm db:generate
```

### dev

```bash
pnpm db:migrate
pnpm dev
```

### preview

```bash
pnpm cf:migrate
pnpm cf:preview
```

### remote

```bash
pnpm cf:migrate-remote
pnpm cf:deploy
```
