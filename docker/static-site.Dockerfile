FROM ghcr.io/pnpm/pnpm AS builder
RUN pnpm runtime set node latest -g
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

FROM ghcr.io/static-web-server/static-web-server
WORKDIR /srv
COPY --from=builder /app/dist/ .
CMD ["--root", "/srv"]
