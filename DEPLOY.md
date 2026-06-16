## Build on CHP

Make sure you are logged on to the [cluster](http://console.chp5-prod.npocloud.nl/) first.

```
# Login to the registry first
oc registry login

# Build the frontend image
docker buildx build --platform linux/amd64 \
-t default-route-openshift-image-registry.apps.cluster.chp5-prod.npocloud.nl/nos-tour-stage-winner/app:main \
.

# push the image to cluster
docker push default-route-openshift-image-registry.apps.cluster.chp5-prod.npocloud.nl/nos-tour-stage-winner/app:main

# Start a new rollout of the app
oc -n nos-tour-stage-winner rollout restart deployment/prod-app
```
