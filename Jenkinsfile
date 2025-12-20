pipeline {
    agent any

    tools {
        nodejs 'nodejs'
    }

    environment {
        DOCKER_USER = 'jackuang3190'
        IMAGE_NAME = 'myapp'
        DISCORD_WEBHOOK = credentials('discord-webhook')
        DOCKER_CREDS = credentials('docker-hub-credentials')
    }

    stages {
        stage('Static Analysis') {
            steps {
                echo "Running Static Analysis on branch: ${env.BRANCH_NAME}"
                sh 'npm install'
                sh 'npm run lint'
            }
        }

        stage('Build & Deploy Staging') {
            when {
                branch 'dev'
            }
            steps {
                script {
                    echo "Deploying to Staging..."
                    def devTag = "dev-${env.BUILD_NUMBER}"
                    def fullImage = "${env.DOCKER_USER}/${env.IMAGE_NAME}:${devTag}"

                    sh "echo $DOCKER_CREDS_PSW | docker login -u $DOCKER_CREDS_USR --password-stdin"

                    sh "docker build -t ${fullImage} ."
                    sh "docker push ${fullImage}"

                    sh "docker rm -f dev-app || true"

                    sh "docker run -d --name dev-app -p 8081:3000 ${fullImage}"
                    
                    sh "sleep 5 && curl -f http://localhost:8081/health || echo 'Health check failed, continuing...'"
                }
            }
        }

        stage('GitOps Promotion') {
            when {
                branch 'main'
            }
            steps {
                script {
                    echo "Promoting to Production via GitOps..."
                    
                    def targetTag = readFile('deploy.config').trim()
                    
                    if (!targetTag) {
                        error "deploy.config is empty!"
                    }

                    def sourceImage = "${env.DOCKER_USER}/${env.IMAGE_NAME}:${targetTag}"
                    def prodTag = "prod-${env.BUILD_NUMBER}"
                    def prodImage = "${env.DOCKER_USER}/${env.IMAGE_NAME}:${prodTag}"

                    sh "echo $DOCKER_CREDS_PSW | docker login -u $DOCKER_CREDS_USR --password-stdin"

                    sh "docker pull ${sourceImage}"
                    sh "docker tag ${sourceImage} ${prodImage}"
                    sh "docker push ${prodImage}"

                    sh "docker rm -f prod-app || true"

                    sh "docker run -d --name prod-app -p 8082:3000 ${prodImage}"
                }
            }
        }
    }

    post {
        failure {
            script {
                def payload = """
                {
                    "content": "**Build Failed!**",
                    "embeds": [{
                        "title": "CI Alert",
                        "color": 15158332,
                        "fields": [
                            { "name": "Student Name", "value": "汪揚傑", "inline": true },
                            { "name": "Student ID", "value": "B12705051", "inline": true },
                            { "name": "Job Name", "value": "${env.JOB_NAME}", "inline": true },
                            { "name": "Build Number", "value": "${env.BUILD_NUMBER}", "inline": true },
                            { "name": "Branch", "value": "${env.BRANCH_NAME}", "inline": true },
                            { "name": "Repo URL", "value": "${env.GIT_URL}", "inline": false },
                            { "name": "Status", "value": "${currentBuild.currentResult}", "inline": true }
                        ]
                    }]
                }
                """
                sh "curl -H 'Content-Type: application/json' -d '${payload}' ${DISCORD_WEBHOOK}"
            }
        }
    }
}