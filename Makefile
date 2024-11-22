# Variables
TAG ?= latest
NAME = monitoring-api
NETWORK = monitoring-network
PORT = 9999
INTERNAL_PORT = 8000

# Default target
.PHONY: all
all: build deploy

# Build the Docker image
.PHONY: build
build:
	@echo "Building Docker image with tag: $(TAG)"
	docker build -t $(NAME):$(TAG) .

# Run the container
.PHONY: deploy
deploy: stop
	@echo "Deploying Docker container with tag: $(TAG)"
	docker run --network $(NETWORK) -p $(PORT):$(INTERNAL_PORT) --name $(NAME) --detach $(NAME):$(TAG)

# Stop and remove the container if it's running
.PHONY: stop
stop:
	@echo "Stopping and removing any running container named: $(NAME)"
	-docker rm -f $(NAME)

# Clean up (remove the image)
.PHONY: clean
clean: stop
	@echo "Removing Docker image with tag: $(TAG)"
	-docker rmi $(NAME):$(TAG)

# Show usage
.PHONY: help
help:
	@echo "Available commands:"
	@echo "  make build        Build the Docker image (default tag: latest)"
	@echo "  make deploy       Deploy the container (default tag: latest)"
	@echo "  make stop         Stop and remove the container"
	@echo "  make clean        Stop the container and remove the image"
	@echo "  make help         Show this help message"
