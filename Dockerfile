# Base image with decent dev tools
FROM ubuntu:22.04

# Prevent interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Update and install essential tools
RUN apt-get update && apt-get install -y \
    curl \
    git \
    build-essential \
    python3 \
    python3-pip \
    unzip \
    sqlite3 \
    cmake \
    libwebsockets-dev \
    libjson-c-dev \
    libssl-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

# Install ttyd
RUN git clone https://github.com/tsl0922/ttyd.git && \
    cd ttyd && \
    mkdir build && \
    cd build && \
    cmake .. && \
    make && \
    make install && \
    cd ../.. && \
    rm -rf ttyd


# Install Bun
ENV BUN_INSTALL=/root/.bun
ENV PATH=$BUN_INSTALL/bin:$PATH
RUN curl -fsSL https://bun.sh/install | bash

# Install Node.js (as backup/alternative and for some tools)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Verify installations
RUN bun --version && node --version && npm --version && python3 --version

# Set working directory
WORKDIR /app

# Copy package files first for caching
COPY package.json tsconfig.json ./

# Install dependencies
RUN bun install

# Copy source code
COPY src ./src

# Create volume mount point for GitHub repositories
RUN mkdir -p /root/gh

# Expose API port
EXPOSE 3000
# Expose ttyd port
EXPOSE 7681


# Start script
COPY start.sh /app/start.sh
ENTRYPOINT ["/app/start.sh"]
CMD ["bun", "run", "start"]

