# Runtime image for `polyclaw gateway`.
#
# This image does NOT build the binary. It expects a prebuilt native
# linux-x64 `polyclaw` executable in the build context — the PolyClaw release
# binary, which includes the `gateway` subcommand. setup.sh places it at
# ./polyclaw (downloading and checksum-verifying it via DIST_URL/DIST_SHA256 if
# missing). Override POLYCLAW_BINARY to point at a different path.
#
# Unlike the GCP example (which mounts the config from Secret Manager at
# runtime), this image BAKES gateway.yaml in at /etc/polyclaw/gateway.yaml — on
# ECS the task definition injects only the secrets the YAML references, as env
# vars. gateway.yaml therefore must be fully filled in (no REPLACE_ME) before
# building; setup.sh enforces this. A config edit means a rebuild under a new
# tag. The file contains no secret values — every credential resolves at boot
# via ${ENV_VAR} expansion.
#
# The image also bakes in the AWS RDS CA bundle (rds-global-bundle.pem —
# setup.sh downloads it from https://truststore.pki.rds.amazonaws.com before
# the build) and trusts it via NODE_EXTRA_CA_CERTS, so the store connection
# string's `?sslmode=verify-full` verifies the RDS server certificate chain
# and hostname. NOTE the gateway's driver reads `sslmode` from the URL but NOT
# a libpq-style `sslrootcert=` param — the CA must come from this env var.
#
# Build:
#   docker build --platform=linux/amd64 --provenance=false \
#     --build-arg POLYCLAW_BINARY=./polyclaw -t polyclaw-gateway .
#
#   (For Fargate on ARM64/Graviton: build --platform=linux/arm64 with the
#   linux-arm64 binary and set the task definition's cpuArchitecture to ARM64.)
#
# Run:
#   docker run --rm -p 8080:8080 \
#     -e OIDC_CLIENT_SECRET -e GATEWAY_JWT_SECRET -e GATEWAY_POSTGRES_URL \
#     polyclaw-gateway

ARG POLYCLAW_BINARY=./polyclaw
ARG GATEWAY_CONFIG=./gateway.yaml
ARG RDS_CA_BUNDLE=./rds-global-bundle.pem

# distroless/cc provides glibc + libstdc++ (required by the Bun-compiled
# native binary). The :nonroot tag runs as uid/gid 65532. Pinned by digest so
# the build never silently takes new upstream bytes (the digest is the
# multi-arch OCI index, so --platform still selects amd64/arm64). To refresh
# the pin after reviewing upstream changes:
#   docker manifest inspect -v gcr.io/distroless/cc-debian12:nonroot   # prints the index digest
FROM gcr.io/distroless/cc-debian12:nonroot@sha256:ce0d66bc0f64aae46e6a03add867b07f42cc7b8799c949c2e898057b7f75a151

ARG POLYCLAW_BINARY
ARG GATEWAY_CONFIG
ARG RDS_CA_BUNDLE
COPY --chmod=0755 ${POLYCLAW_BINARY} /usr/local/bin/polyclaw
# WORKDIR pre-creates /etc/polyclaw with 0755 — without it, COPY --chmod would
# also stamp the auto-created parent directory 0644 (no execute bit), making
# the config unreadable for the nonroot user.
WORKDIR /etc/polyclaw
COPY --chmod=0644 ${GATEWAY_CONFIG} /etc/polyclaw/gateway.yaml
COPY --chmod=0644 ${RDS_CA_BUNDLE} /etc/polyclaw/rds-global-bundle.pem
WORKDIR /

ENV POLYCLAW_CONFIG_DIR=/tmp/.polyclaw
# Trust anchor for the store's sslmode=verify-full (see header comment).
ENV NODE_EXTRA_CA_CERTS=/etc/polyclaw/rds-global-bundle.pem

EXPOSE 8080
USER nonroot

ENTRYPOINT ["/usr/local/bin/polyclaw", "gateway", "--config", "/etc/polyclaw/gateway.yaml"]
