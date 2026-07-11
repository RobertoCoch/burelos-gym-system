FROM alpine:latest

# Define the PocketBase version
ARG PB_VERSION=0.36.6

# Install required packages
RUN apk add --no-cache \
    unzip \
    ca-certificates

# Download and unzip PocketBase
ADD https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip /tmp/pb.zip
RUN unzip /tmp/pb.zip -d /pb/

# Clean up
RUN rm /tmp/pb.zip

# Expose PocketBase port
EXPOSE 8090

# Start PocketBase server
CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8090"]
