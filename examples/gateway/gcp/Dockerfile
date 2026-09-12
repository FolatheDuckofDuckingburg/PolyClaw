# syntax=docker/dockerfile:1

# Runtime image for `polyclaw gateway`.
#
# This image does NOT build the binary. It expects a prebuilt native
# linux-x64 `polyclaw` executable in the build context — the public PolyClaw
# release binary, which includes the `gateway` subcommand. setup.sh places it
# at ./polyclaw (downloading it from the public release endpoint and verifying
# it against the release manifest if missing). Override POLYCLAW_BINARY to
# point at a different path.
#
# Build (with the binary at ./polyclaw; otherwise add --build-arg POLYCLAW_BINARY=<path>):
#   docker build --platform=linux/amd64 --provenance=false -t polyclaw-gateway .
#
# Run:
#   docker run --rm -p 8080:8080 \
#     -v "$PWD/gateway.yaml:/etc/polyclaw/gateway.yaml:ro" \
#     -e OIDC_CLIENT_SECRET -e GATEWAY_JWT_SECRET -e GATEWAY_POSTGRES_URL \
#     polyclaw-gateway

ARG POLYCLAW_BINARY=./polyclaw

# distroless/cc provides glibc + libstdc++ (required by the Bun-compiled
# native binary). The :nonroot tag runs as uid/gid 65532.
FROM gcr.io/distroless/cc-debian12:nonroot

ARG POLYCLAW_BINARY
COPY --chmod=0755 ${POLYCLAW_BINARY} /usr/local/bin/polyclaw

ENV POLYCLAW_CONFIG_DIR=/tmp/.polyclaw

EXPOSE 8080
USER nonroot

ENTRYPOINT ["/usr/local/bin/polyclaw", "gateway", "--config", "/etc/polyclaw/gateway.yaml"]
