#!/usr/bin/env bash
set -euo pipefail
set +x
kubectl get namespace ns-claudio-zamora >/dev/null
if kubectl get secret secret-claudio-zamora -n ns-claudio-zamora >/dev/null 2>&1; then
  echo 'El Secret ya existe; no se modifica.'
  exit 0
fi
read -r -s -p 'Introduce API_KEY: ' laboratorio_api_key
printf '\n'
if [ -z "$laboratorio_api_key" ]; then
  echo 'API_KEY no puede estar vacía.' >&2
  exit 1
fi
# El valor se envía por stdin; no queda en argumentos, archivos ni Git.
printf '%s' "$laboratorio_api_key" | kubectl create secret generic secret-claudio-zamora \
  -n ns-claudio-zamora --from-file=API_KEY=/dev/stdin
unset laboratorio_api_key
