## Build on CHP

Make sure you have an active `oc` session on the
[cluster](http://console.chp5-prod.npocloud.nl/) first (`oc login ...`) — the
registry login below reuses that session's token.

```
# Log Docker in to the cluster registry, using your oc token.
# NB: `oc registry login` only saves credentials for podman, not docker, so
# `docker push` fails with "no basic auth credentials" — use this instead.
docker login -u $(oc whoami) -p $(oc whoami -t) \
default-route-openshift-image-registry.apps.cluster.chp5-prod.npocloud.nl

# Build and push the image.
# --provenance=false --sbom=false keep it a single, plain image: the OpenShift
# integrated registry rejects the buildx attestation/manifest-list output.
docker buildx build --platform linux/amd64 --provenance=false --sbom=false \
-t default-route-openshift-image-registry.apps.cluster.chp5-prod.npocloud.nl/nos-tour-stage-winner/app:main \
--push .

# Start a new rollout of the app
oc -n nos-tour-stage-winner rollout restart deployment/prod-app
```

Ofwel
```
docker login -u $(oc whoami) -p $(oc whoami -t) default-route-openshift-image-registry.apps.cluster.chp5-prod.npocloud.nl && \
docker buildx build --platform linux/amd64 --provenance=false --sbom=false \
-t default-route-openshift-image-registry.apps.cluster.chp5-prod.npocloud.nl/nos-tour-stage-winner/app:main \
--push . && \
oc -n nos-tour-stage-winner rollout restart deployment/prod-app
```
