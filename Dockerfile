FROM node:16.6.0-alpine3.14 AS front-builder

WORKDIR /opt/openex-build/openex-front
COPY openex-front/package.json openex-front/yarn.lock ./
RUN yarn install
COPY openex-front /opt/openex-build/openex-front
RUN yarn build

FROM maven:3.8.4-openjdk-17 AS api-builder

WORKDIR /opt/openex-build/openex-api
COPY openex-api /opt/openex-build/openex-api
COPY --from=front-builder /opt/openex-build/openex-front/build ./openex-front/build
RUN mvn install -DskipTests

FROM openjdk:17-slim AS app

RUN DEBIAN_FRONTEND=noninteractive apt-get update -q && DEBIAN_FRONTEND=noninteractive apt-get install -qq -y tini;
COPY --from=api-builder /opt/openex-build/openex-api/target/openex-api.jar ./

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["java", "-jar", "openex-api.jar"]
