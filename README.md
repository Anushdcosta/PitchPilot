<div align="center">
<img width="600" alt="header image" src="https://github.com/user-attachments/assets/427c1a9d-bb12-4689-9ad7-be3afccf378c">
<h2 align="center">PitchPilot</h2>
  <p align="center">
    AI Startup Idea Generator
    <br />
    <a href="https://github.com/Anushdcosta/startup-pitcher/issues/new?labels=bug&template=bug-report.md">Report Bug</a>
    ·
    <a href="https://github.com/Anushdcosta/startup-pitcher/issues/new?labels=enhancement&template=feature-request.md">Request Feature</a>
  </p>
</div>

An AI-powered tool that generates and refines startup pitch ideas based on user keywords. Built using Langchain.js, Tailwind CSS, React, and TypeScript.

## ✨ Features

- Generate startup ideas from keywords
- Remix/refine pitch elements (name, tagline, etc.)
- Export clean PDFs
- Surprise Me! button for random ideas
- REST API backend (Node.js + Express)
- Clean UI with Tailwind CSS
- Written in TypeScript

## 🛠 Tech Stack

- **Frontend**: React, Tailwind CSS, TypeScript
- **Backend**: Node.js, Express
- **AI/Logic**: Langchain.js
- **PDF**: jsPDF
- **Deployment**: GitHub Codespaces & Replit
#
# 🧑‍💻 Getting Started


## METHOD 1:  ⚡ One-Click Codespaces Setup

Click below to launch this project in a ready-to-code GitHub Codespace:

[![Open in Codespaces](https://github.com/codespaces/badge.svg)](https://github.com/codespaces/new?repo=Anushdcosta/startup-pitcher&ref=main)

Once the Window loads run the following commands:

```bash
chmod +x setup.sh
./setup.sh
```
For the Github Token click the below button to visit the models page
<p align="left">
  <a href="https://github.com/marketplace/models/azure-openai/gpt-4-1-mini" target="_blank">
    <img src="https://img.shields.io/badge/Visit%20Github-OpenAI 4.1 mini-blue?style=for-the-badge" alt="Visit Github Models">
  </a>
</p>
Click Use this Model and follow the steps to generate a fine grain token

Once Token is added Run the following command in Codespace terminal:
```bash
npm run dev
```

## METHOD 2: 🧪 Local Development Setup

This branch (`local-alternative`) is optimized for running locally on your own machine.

---

### 🔧 Prerequisites

- Node.js (v18+)
- npm
- ollama

---

## 🖥 Intallation

### 🧰 Install Ollama

To run local LLMs (like Mistral or Phi), you'll need Ollama installed:

<p align="left">
  <a href="https://ollama.com/download/windows" target="_blank">
    <img src="https://img.shields.io/badge/Download%20Ollama-Windows-blue?style=for-the-badge&logo=windows" alt="Download Ollama for Windows">
  </a>
</p>
 - After Installing ollama run the below code in CMD/Powershell.

```bash
ollama pull nous-hermes2
```
## Github Repository

## 🛠️ Getting Started

```bash
::1. Clone the repository
git clone https://github.com/Anushdcosta/startup-pitcher

::2. Change current directory
cd startup-pitcher

::2. Checkout the local branch
git checkout local-alternative

::3. Install dependencies
.\setup.bat

::4. Start the development server
npm run dev
```
