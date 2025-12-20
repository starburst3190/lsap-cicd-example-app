pipeline {
    agent any

    tools {
        nodejs 'nodejs'
    }

    environment {
        DISCORD_WEBHOOK = credentials('discord-webhook')
    }

    stages {
        stage('Static Analysis') {
            steps {
                echo "Running Static Analysis on branch: ${env.BRANCH_NAME}"
                sh 'npm install'
                sh 'npm run lint'
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
                        "title": "CI Alert: ${env.JOB_NAME}",
                        "color": 15158332,
                        "fields": [
                            { "name": "Student Name", "value": "汪揚傑", "inline": true },
                            { "name": "Student ID", "value": "B12705051", "inline": true },
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