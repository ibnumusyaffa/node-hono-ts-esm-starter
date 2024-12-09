set -e
docker-compose -f docker-compose.yml build
docker-compose -f docker-compose.yml down
docker-compose -f docker-compose.yml up -d
# sleep 10 # Pause for 5 seconds
docker exec -i app-node-ts npx kysely migrate:latest