# StreamLink

[![Latest Release](https://img.shields.io/github/v/release/decryptable/stream-link?label=Download&style=for-the-badge)](https://github.com/decryptable/stream-link/releases/latest)
![License](https://img.shields.io/badge/License-Non--Commercial-red?style=for-the-badge)

**StreamLink** is an advanced, open-source automation tool designed specifically for TikTok Live. It bridges the gap between streamers and their audience by converting real-time interactions—like gifts, likes, and chat messages—into automated actions on your PC.

## Key Features

- **Real-Time Triggers**: React instantly to Gifts, Likes, Chat, Follows, and Shares.
- **Powerful Automation**:
  - **Keyboard & Mouse**: Simulate keystrokes, holds, and clicks.
  - **Overlay Integration**: Display images, videos, and alerts directly on your stream via OBS.
  - **Text-to-Speech (TTS)**: Advanced TTS alerts for specific events.
  - **System Commands**: Execute shell commands or scripts.
- **Modern Dashboard**: A sleek, dark-mode interface for managing all your configurations.
- **Localization**: Native support for **English** and **Bahasa Indonesia**.

## Getting Started

### Prerequisites

- Node.js (LTS)
- npm

### Installation

1.  **Clone the repository**:

    ```bash
    git clone https://github.com/decryptable/stream-link.git
    cd stream-link
    ```

2.  **Install dependencies**:

    ```bash
    npm install
    ```

3.  **Run in Development Mode**:

    ```bash
    npm run electron:dev
    ```

4.  **Build for Production**:
    ```bash
    npm run electron:build
    ```

## Usage

1.  **Connect**: Enter your TikTok username on the dashboard to start listening for events.
2.  **Create Triggers**: Go to the "Triggers" tab to define what events (e.g., "Rose Gift") you want to track.
3.  **Assign Actions**: Link those triggers to specific actions (e.g., "Press F5", "Play Sound").
4.  **Overlay**: Add the provided Overlay URL to OBS as a **Browser Source** to visualize alerts.

## Contributing

We welcome contributions! Please read our [Contribution Guide](CONTRIBUTING.md) for details on how to submit pull requests, report issues, and suggest features.

## License & Terms

**StreamLink is Free and Open Source for Personal, Non-Commercial Use.**

This software is licensed under a modified MIT License with a strict **Non-Commercial** clause.

- ✅ **You CAN:** Use, modify, and share this software for free.
- ❌ **You CANNOT:** Sell, redistribute for profit, or use this software as part of a paid product/service.

See the full [LICENSE](LICENSE) for details.

---

<p align="center">
  Developed by <a href="https://decryptable.dev">decryptable</a>
</p>
