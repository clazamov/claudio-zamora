pipeline {
  agent {
    kubernetes {
      cloud 'kubernetes'
      namespace 'jenkins'
      yamlFile 'agent.yaml'
      defaultContainer 'node'
    }
  }
  options { disableConcurrentBuilds() }
  parameters {
    booleanParam(name: 'DEPLOY', defaultValue: false, description: 'Activar esta rama en el ambiente compartido')
    string(name: 'DOCKERHUB_USER', defaultValue: 'clazamov', description: 'Usuario real de Docker Hub')
    string(name: 'GHCR_USER', defaultValue: 'clazamov', description: 'Usuario/organización GitHub en minúsculas; confirmar')
    string(name: 'KUBECTL_VERSION', defaultValue: 'v1.37.0', description: 'Versión compatible con el servidor; confirmar disponibilidad')
  }
  environment {
    DOCKER_HOST = 'tcp://127.0.0.1:2375'
    IMAGE_NAME = 'claudiozamora'
    IMAGE_TAG = 'claudio-zamora'
  }
  stages {
    stage('install') {
      steps {
        script {
          if (!(params.DOCKERHUB_USER ==~ /[a-z0-9][a-z0-9_-]*/)) { error('Completa DOCKERHUB_USER válido') }
          if (!(params.GHCR_USER ==~ /[a-z0-9][a-z0-9-]*/)) { error('Completa GHCR_USER válido') }
          if (!(params.KUBECTL_VERSION ==~ /v[0-9]+\.[0-9]+\.[0-9]+/)) { error('Versión kubectl inválida') }
          if (env.BRANCH_NAME == 'main') {
            env.APP_AMBIENTE = 'production'
            env.IMAGE_TAG = 'claudio-zamora-main'
          } else if (env.BRANCH_NAME == 'developer') {
            env.APP_AMBIENTE = 'develop'
            env.IMAGE_TAG = 'claudio-zamora-developer'
          } else {
            error('Sólo se permiten las ramas main y developer')
          }
          env.DOCKER_IMAGE = "docker.io/${params.DOCKERHUB_USER}/${env.IMAGE_NAME}:${env.IMAGE_TAG}"
          env.GHCR_IMAGE = "ghcr.io/${params.GHCR_USER}/${env.IMAGE_NAME}:${env.IMAGE_TAG}"
        }
        sh '''set -eu
          apk add --no-cache curl git
          corepack enable
          test -f pnpm-lock.yaml
          pnpm install --frozen-lockfile
          mkdir -p .ci-bin
          curl -fL --retry 3 "https://dl.k8s.io/release/$KUBECTL_VERSION/bin/linux/amd64/kubectl" -o .ci-bin/kubectl
          curl -fL --retry 3 "https://dl.k8s.io/release/$KUBECTL_VERSION/bin/linux/amd64/kubectl.sha256" -o .ci-bin/kubectl.sha256
          printf '%s  .ci-bin/kubectl\n' "$(cat .ci-bin/kubectl.sha256)" | sha256sum -c -
          chmod +x .ci-bin/kubectl
        '''
      }
    }
    stage('test') {
      steps {
        sh 'pnpm run test:cov --runInBand && pnpm run test:e2e --runInBand'
      }
    }
    stage('build') {
      steps {
        container('docker') {
          sh '''set -eu
            for i in $(seq 1 60); do
              if docker info >/dev/null 2>&1; then break; fi
              sleep 2
            done
            docker info >/dev/null
            docker build -t "$DOCKER_IMAGE" .
            docker tag "$DOCKER_IMAGE" "$GHCR_IMAGE"
          '''
        }
      }
    }
    stage('push') {
      steps {
        container('docker') {
          withCredentials([
            usernamePassword(credentialsId: 'dockerhub-token', usernameVariable: 'DH_USER', passwordVariable: 'DH_TOKEN'),
            usernamePassword(credentialsId: 'ghcr-registry', usernameVariable: 'GH_USER', passwordVariable: 'GH_TOKEN')
          ]) {
            sh '''set +x
              set -eu
              export DOCKER_CONFIG="$(mktemp -d)"
              trap 'rm -rf "$DOCKER_CONFIG"' EXIT
              printf '%s' "$DH_TOKEN" | docker login docker.io -u "$DH_USER" --password-stdin
              printf '%s' "$GH_TOKEN" | docker login ghcr.io -u "$GH_USER" --password-stdin
              docker push "$DOCKER_IMAGE"
              docker push "$GHCR_IMAGE"
            '''
          }
        }
      }
    }
    stage('deploy') {
      when { expression { return params.DEPLOY } }
      steps {
        lock(resource: 'despliegue-ns-claudio-zamora') {
        sh '''set -eu
          trap 'rm -f .rendered.yaml' EXIT
          .ci-bin/kubectl get secret secret-claudio-zamora -n ns-claudio-zamora -o name
          node ci-render.cjs
          .ci-bin/kubectl apply --server-side --field-manager=jenkins -f .rendered.yaml
          .ci-bin/kubectl rollout restart deployment/app-claudio-zamora -n ns-claudio-zamora
          .ci-bin/kubectl rollout status deployment/app-claudio-zamora -n ns-claudio-zamora --timeout=300s
        '''
        }
      }
    }
  }
}
