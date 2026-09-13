# Supplies the single zone file below. The atlas-local image is built on
# ubi9-minimal stripped down to the point that it has no package manager
# (only `rpm`) and ships no tzdata at all - no /usr/share/zoneinfo and no
# /etc/localtime - so the zone has to be brought in from outside rather than
# installed.
FROM alpine:3.22 AS tzdata
RUN apk add --no-cache tzdata

# Atlas-local rather than plain `mongo`, because it bundles the `mongot` search
# process alongside `mongod`. Without it, `$vectorSearch` / `$search` and the
# `createSearchIndex` / `$listSearchIndexes` helpers fail outright with
# "only allowed on MongoDB Atlas", so the face-search code path could not be
# built or tested locally against the same query it runs in production.
FROM mongodb/mongodb-atlas-local:8.3.8

# The image already declares EXPOSE 27017 and VOLUME /data/db, and its CMD
# (`runner server`) starts mongod + mongot and initialises the single-node
# replica set that search requires - so there is deliberately no ENTRYPOINT
# override here. Overriding it with a bare `mongod` would start the database
# without mongot and put us back to the plain-`mongo` behaviour.

# Runs as the unprivileged `mongod` user; drop to root only to place the
# timezone files, then hand the user back.
USER root
ENV TZ=Asia/Karachi
COPY --from=tzdata /usr/share/zoneinfo/Asia/Karachi /usr/share/zoneinfo/Asia/Karachi
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
USER mongod

VOLUME /data/backup
