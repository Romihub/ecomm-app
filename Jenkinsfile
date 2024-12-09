pipeline {
    agent any
    
    environment {
        ACR_NAME = '${REGISTRY_NAME}.azurecr.io'
        RESOURCE_GROUP = '${RESOURCE_GROUP}'
        AKS_CLUSTER = '${AKS_CLUSTER}'
        AZURE_CREDS = credentials('aks-cred')
        ACR_CREDS = credentials('acr-cred')
    }
    
    stages {
        stage('Checkout Application') {
            steps {
                git url: 'https://github.com/Romihub/ecomm-app.git',
                    branch: 'master'
            }
        }
        
        stage('Azure Login') {
            steps {
                withCredentials([azureServicePrincipal('azure-credentials')]) {
                    sh '''
                        az login --service-principal \
                            --username $AZURE_CLIENT_ID \
                            --password $AZURE_CLIENT_SECRET \
                            --tenant $AZURE_TENANT_ID
                        
                        az aks get-credentials \
                            --resource-group ${RESOURCE_GROUP} \
                            --name ${AKS_CLUSTER} \
                            --overwrite-existing
                    '''
                }
            }
        }

        stage('Build and Push Images') {
            parallel {
                stage('Frontend') {
                    steps {
                        dir('frontend') {
                            sh 'npm ci'
                            sh 'npm run build'
                            script {
                                docker.build("${ACR_NAME}/frontend:${BUILD_NUMBER}").push()
                            }
                        }
                    }
                }
                
                stage('Services') {
                    steps {
                        script {
                            def services = ['auth', 'catalog', 'payment', 'orders']
                            def builds = [:]
                            
                            services.each { service ->
                                builds[service] = {
                                    dir("services/${service}") {
                                        sh 'npm ci'
                                        sh 'npm run test || true'
                                        docker.build("${ACR_NAME}/${service}:${BUILD_NUMBER}").push()
                                    }
                                }
                            }
                            
                            parallel builds
                        }
                    }
                }
            }
        }

        stage('Deploy to AKS') {
            steps {
                sh '''
                    # Update image tags in deployment files
                    for service in frontend auth catalog payment orders; do
                        sed -i "s|${ACR_NAME}/${service}:.*|${ACR_NAME}/${service}:${BUILD_NUMBER}|" k8s/${service}/deployment.yaml
                    done
                    
                    # Apply Kubernetes manifests
                    kubectl apply -f k8s/

                    # Wait for deployments
                    for service in frontend auth catalog payment orders; do
                        kubectl rollout status deployment/${service} -n romihub-${service}
                    done
                '''
            }
        }
    }
    
    post {
        always {
            sh 'az logout'
            cleanWs()
        }
    }
}