#!/usr/bin/env groovy

node {
  properties([disableConcurrentBuilds()])

  try {

    project = "seller-chozoi-vn"
    dockerRepo = "dockerhub.infra.chozoi.services"
    imagePrefix = "ci"
    dockerFile = "Dockerfile"
    imageName = "${dockerRepo}/${imagePrefix}/${project}"
    buildNumber = "${env.BUILD_NUMBER}"
    k8sCluster = "local"
    k8sNamespace = "default"

    stage('checkout code') {
      checkout scm
      sh "git checkout ${env.BRANCH_NAME} && git reset --hard origin/${env.BRANCH_NAME}"
    }

    stage('build') {
      sh """
        egrep -q '^FROM .* AS builder\$' ${dockerFile} \
          && docker build -t ${imageName}-stage-builder --target builder -f ${dockerFile} .
        docker build -t ${imageName}:${env.BRANCH_NAME} -f ${dockerFile} .
      """
    }
    stage('push') {
      sh """
        docker push ${imageName}:${env.BRANCH_NAME}
        docker tag ${imageName}:${env.BRANCH_NAME} ${imageName}:${env.BRANCH_NAME}-build-${buildNumber}
        docker push ${imageName}:${env.BRANCH_NAME}-build-${buildNumber}
      """
    }
    switch(env.BRANCH_NAME) {
      case 'develop':
        k8sNamespace = "chozoi-dev"
        stage('deploy-dev') {
          sh """
            export IMAGE_BUILD="${imageName}:${env.BRANCH_NAME}-build-${buildNumber}"
            k8sctl _deploy_rancher_dev ${k8sCluster} ${project} ${k8sNamespace}
          """
        }
      break
      case 'master':
        k8sNamespace = "chozoi-prod"
        stage('deploy-prod') {
          sh """
            export IMAGE_BUILD="${imageName}:${env.BRANCH_NAME}-build-${buildNumber}"
            k8sctl _deploy_rancher_prod ${k8sCluster} ${project} ${k8sNamespace}
          """
        }
      break
    }

  } catch (e) {
    currentBuild.result = "FAILED"
    throw e
  }
}
