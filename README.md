# Daily AI Newsletter

An automated daily AI newsletter generation system with a clean, Notion-inspired frontend.

## Features

- **Automated Content Generation**: Scheduled daily at 8:00 AM and 4:00 PM
- **AI-Powered**: Uses Serper API for news search and Gemini API for content synthesis
- **Notion-Inspired UI**: Clean, minimalist design with monochromatic color palette
- **Responsive**: Mobile-friendly, centered layout with max-width 800px
- **Content Structure**:
  - Catchy headlines
  - Top AI news stories
  - New AI tools and products
  - Cutting-edge research
  - Quick insights

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Express.js, Serper API, Gemini API
- **Build Tool**: Vite

## Setup

### Frontend

```bash
cd ai-newsletter
pnpm install
pnpm dev
```

### Backend (Optional - for live data)

```bash
cd server
npm install
SERPER_API_KEY=your_key GEMINI_API_KEY=your_key node newsletter-api.js
```

## Environment Variables

- `SERPER_API_KEY`: API key for Serper search
- `GEMINI_API_KEY`: API key for Gemini content synthesis

## Design Guidelines

- **Color Palette**: Black (#000000), White (#FFFFFF), Grays
- **Typography**: Inter font family
- **Layout**: Single-column, centered, max-width 800px
- **Links**: Underlined on hover
- **Buttons**: Text with arrow (e.g., [Read More →])
- **Separators**: Light gray, 1px horizontal lines
