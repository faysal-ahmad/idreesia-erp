# Building for Production and Deployment

## Database
The app uses MongoDB as it's underlying datastore. We build a custom docker image for it and push it to docker hub repository `faysalahmad/idreesia-db`. The Dockerfile for building the image is in the `containers/mongo` directory in the source code.

In order to build the image and push it to Docker Hub, use the following commands.

```
docker build -t faysalahmad/idreesia-db containers/mongo
```
```
docker login
```
```
docker push faysalahmad/idreesia-db
```

## Idreesia-Web, Idreesia-Jobs
The Github repository for the application is linked to CircleCI, which on every push to the master branch of the repository, builds the meteor apps and then builds the docker images for these apps. Once built the docker images are pushed to Docker Hub as `faysalahmad/idreesia-web` and `faysalahmad/idreesia-jobs`.
The Docker Compose file for the production server then directly refers to the latest images from docker hub for these applications.

