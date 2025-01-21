# Learning management system API Docker Image

This repository provides a Docker image for the E-commerce API. You can easily deploy this API by using Docker.

## Prerequisites

- Docker installed on your machine. You can download and install Docker from [here](https://www.docker.com/get-started).

## How to Use

### 1. Pull the Docker Image

To get started, pull the latest version of the Docker image from Docker Hub by running the following command:

```bash

docker pull elshirbini/lms-api:latest

```

### 2. Run the Docker Container

After pulling the image, run it with the following command:

```bash
docker run -d -p 8080:8080 --name lms-api elshirbini/lms-api:latest
```

### 3. Access the API

Once the container is running, you can access the API by navigating to: http://localhost:8080

### 4. Stop the Running Container

If you want to stop the container, use the following command:

```bash
docker stop lms-api
```

### 5. Remove the Container

To remove the stopped container, run:

```bash
docker rm lms-api
```
