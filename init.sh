set -e
docker exec -i app-node-ts npx kysely migrate:latest
docker exec -i app-node-ts npx kysely seed:run