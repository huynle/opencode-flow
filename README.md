# Opencode Flow

Opencode Flow is a self-hosted AI software engineer architecture. It uses a custom orchestrator service to integrate with GitHub and a self-hosted Opencode.ai instance.

## Features

- **Containerized Architecture**: Built on Ubuntu 22.04 with Bun and Node.js.
- **GitHub Integration**: Designed to manage and interact with GitHub repositories.
- **Persistent Sessions**: Uses SQLite to manage persistent sessions.

## getting Started

### Prerequisites

- Docker

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/huy/opencode-flow.git
    cd opencode-flow
    ```

2.  Build the Docker image:
    ```bash
    docker build -t opencode-flow .
    ```

3.  Run the container:
    ```bash
    docker run -d -p 3000:3000 --name opencode-flow opencode-flow
    ```
