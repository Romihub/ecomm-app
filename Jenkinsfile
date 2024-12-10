pipeline {
    agent any
    
    environment {
        RESOURCE_GROUP = 'RESOURCE_GRP'
        AKS_CLUSTER = 'aks-cluster'
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
        
        stage('Get AKS Credentials') {
            steps {
                withCredentials([
                    azureServicePrincipal('aks-cred'),
                    string(credentialsId: 'RESOURCE_GRP', variable: 'RESOURCE_GROUP'),
                    string(credentialsId: 'aks-cluster', variable: 'AKS_CLUSTER')
                ]) {
                    sh """
                        # Login to Azure
                        az login --service-principal \
                            --username=\"\${AZURE_CLIENT_ID}\" \
                            --password=\"\${AZURE_CLIENT_SECRET}\" \
                            --tenant=\"\${AZURE_TENANT_ID}\"
                        
                        az account set --subscription \"\${AZURE_SUBSCRIPTION_ID}\"
                        
                        # Get AKS credentials
                        az aks get-credentials \
                            --resource-group "\${RESOURCE_GROUP}" \
                            --name "\${AKS_CLUSTER}" \
                            --overwrite-existing
                    """
                }
            }
        }

        stage('Build and Push Images') {
            steps {
                withCredentials([
                    azureServicePrincipal('aks-cred'),
                    string(credentialsId: 'REGISTRY_NAME', variable: 'REGISTRY_NAME')
                ]) {
                    script {
                        def acrUrl = "${REGISTRY_NAME}.azurecr.io"
                        
                        // Login to ACR
                        sh """
                            az acr login --name ${REGISTRY_NAME}
                        """
                        
                        parallel (
                            'Frontend': {
                                dir('frontend') {
                                    sh 'npm install'
                                    sh 'npm run build'
                                    sh """
                                        docker build -t ${acrUrl}/frontend:${BUILD_NUMBER} .
                                        docker push ${acrUrl}/frontend:${BUILD_NUMBER}
                                    """
                                }
                            },
                            'Services': {
                                script {
                                    def services = ['auth', 'catalog', 'payment', 'orders']
                                    def builds = [:]
                                    
                                    services.each { service ->
                                        builds[service] = {
                                            dir("services/${service}") {
                                                sh 'npm install'
                                                sh 'npm run test || true'
                                                sh """
                                                    docker build -t ${acrUrl}/${service}:${BUILD_NUMBER} .
                                                    docker push ${acrUrl}/${service}:${BUILD_NUMBER}
                                                """
                                            }
                                        }
                                    }
                                    
                                    parallel builds
                                }
                            }
                        )
                    }
                }
            }
        }

        stage('Deploy to AKS') {
            steps {
                withCredentials([string(credentialsId: 'REGISTRY_NAME', variable: 'REGISTRY_NAME')]) {
                    script {
                        def acrUrl = "${REGISTRY_NAME}.azurecr.io"
                        //sh """
                        //    for service in frontend auth catalog payment orders; do
                        //        sed -i "s|${acrUrl}/${service}:.*|${acrUrl}/${service}:${BUILD_NUMBER}|" k8s/\${service}/deployment.yaml
                        //    done
                        //"""

                        sh """
                            kubectl apply -f K8/namespaces.yaml
                            kubectl apply -f K8/
                            
                            kubectl rollout status deployment -n ecomm-backend
                            kubectl rollout status deployment -n ecomm-frontend
                        """
                    } 
                }
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