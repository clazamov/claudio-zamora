pipeline {
  agent {
    kubernetes {
       defaultContainer 'node-tool'
       yamlFile 'agent.yaml'
      
    }
  }
  
  environment {
    // BuildKit no requiere DOCKER_HOST.
    IMAGE_NAME = 'claudiozamora'
    IMAGE_TAG = 'claudio-zamora'
     APP_VERSION = '3.0.0'
     NAME_TAG    = 'claudio-zamora'
     DH_REPO     = 'clazamov/claudiozamora'
     GH_REPO     = 'ghcr.io/clazamov/claudio-zamora'
     K8S_SECRET  = 'secret-claudio-zamora'
     K8S_NS      = 'ns-claudio-zamora'
     K8S_DEPLOY  = 'app-claudio-zamora'
  }
  stages {
    stage('install') {
      steps {
                sh 'echo "step install"'
                sh 'corepack enable'
                sh 'node --version'
                sh 'npm --version'
                sh 'pnpm install --frozen-lockfile'
            }
        }
    stage('test') {
        steps {
                sh 'echo "prueba de test"'
                sh 'pnpm run test:cov --runInBand && pnpm run test:e2e --runInBand'
            }
        }
     stage('build') {
            steps {
                sh 'echo "prueba build"'
                sh 'pnpm run build'
            }
        }
     stage('push') {
            steps {
                script {
                    if (env.BRANCH_NAME == 'main') {
                        env.APP_AMBIENTE = 'production'
                        env.PUBLISH_TAG = 'claudio-zamora-main'
                    } else if (env.BRANCH_NAME == 'developer') {
                         env.APP_AMBIENTE = 'develop'
                         env.PUBLISH_TAG = 'claudio-zamora-developer'
                     } else {
                          error('Sólo se permiten las ramas main y developer')
                     }
                    env.DOCKER_IMAGE = "docker.io/${env.DH_REPO}:${env.PUBLISH_TAG}"
                    env.GHCR_IMAGE = "${env.GH_REPO}:${env.PUBLISH_TAG}"
                }
                container('buildkit') {
                    sh 'echo "subida de codigo push"'
                    sh '''
                        set -eu
                        export DOCKER_CONFIG=/docker-config/dockerhub
                        test -s ${DOCKER_CONFIG}/config.json

                        buildctl-daemonless.sh build \
                        --frontend dockerfile.v0 \
                        --local context=. \
                        --local dockerfile=. \
                        --output 'type=image,"name='"${DH_REPO}:${PUBLISH_TAG},${DH_REPO}:${APP_VERSION}"'",push=true'

                        export DOCKER_CONFIG=/docker-config/github
                        test -s ${DOCKER_CONFIG}/config.json

                        buildctl-daemonless.sh build \
                        --frontend dockerfile.v0 \
                        --local context=. \
                        --local dockerfile=. \
                        --output 'type=image,"name='"${GH_REPO}:${PUBLISH_TAG},${GH_REPO}:${APP_VERSION}"'",push=true'
                    '''
                }
            }
        }

    stage('deploy') {
          steps {
                container('kubectl-tool') {
                    sh 'echo "Comenzando etapa de deploy"'
                    withCredentials([string(credentialsId: 'api-key-secret', variable: 'API_KEY')]) {
                        sh '''
                            set +x
                            set -eu
                            kubectl apply -f entrega.yaml

                            kubectl create secret generic ${K8S_SECRET} \
                              --from-literal=API_KEY="${API_KEY}" -n ${K8S_NS} \
                              --dry-run=client -o yaml | kubectl apply -f -

                            kubectl -n ${K8S_NS} rollout restart deployment/${K8S_DEPLOY}
                            kubectl -n ${K8S_NS} rollout status deployment/${K8S_DEPLOY} --timeout=120s
                            kubectl -n ${K8S_NS} get pods
                        '''
                    }
                }
            }
        }
    }

}