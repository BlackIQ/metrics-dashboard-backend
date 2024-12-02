# Default target
.PHONY: all
all: build deploy

# Build the Docker images
.PHONY: build
build:
	@echo "Building Docker images"
	docker-compose build

# Run the container using docker-compose
.PHONY: deploy
deploy:
	@echo "Deploying all containers with docker-compose"
	docker-compose up -d

# Stop and remove all containers
.PHONY: stop
stop:
	@echo "Stopping and removing all containers"
	docker-compose down

# Clean up (remove the images)
.PHONY: clean
clean: stop
	@echo "Removing Docker images with tag: $(TAG)"
	docker-compose down --rmi all

# Show usage
.PHONY: help
help:
	@echo "Available commands:"
	@echo "  make build        Build the Docker images"
	@echo "  make deploy       Deploy all containers using docker-compose"
	@echo "  make stop         Stop and remove all containers"
	@echo "  make clean        Stop the containers, remove images"
	@echo "  make help         Show this help message"
