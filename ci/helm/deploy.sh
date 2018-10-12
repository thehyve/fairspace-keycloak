#!/bin/bash

ENVIRONMENT=${1:-ci}

helm repo add fairspace https://fairspace.github.io/helm-repo
helm repo update
helm upgrade --install hyperspace-${ENVIRONMENT} fairspace/hyperspace --namespace=hyperspace-${ENVIRONMENT} -f ./ci/${ENVIRONMENT}-values.yaml