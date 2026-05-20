FROM gvenzl/oracle-xe:21-slim

ENV ORACLE_PASSWORD=111206
ENV APP_USER=rm563719
ENV APP_USER_PASSWORD=111206
 
COPY /container-entrypoint-initdb.d/pettrack.sql /container-entrypoint-initdb.d/pettrack.sql

EXPOSE 1521