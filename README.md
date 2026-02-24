# Chat Application

A real-time chat application built using **Next.js (App Router)**, **TypeScript**, **Convex**, **Clerk**, **Tailwind CSS**, and **shadcn/ui**. This app showcases a modern and scalable chat system with advanced features.

## Features
### Core Features
- **Authentication:** User sign-up/sign-in using Clerk.
- **Real-Time Messaging:** Powered by Convex for low-latency communication.
- **DMs & Group Chat:** One-on-one and group-based messaging support.

### Enhanced Functionality
- **Message Actions:**
  - Add, remove, and display reactions.
  - Delete own messages.
- **Real-Time Indicators:**
  - Online/offline statuses.
  - Typing indicators.
- **Notifications:** Sound alerts for new messages, with browser notifications when the tab is inactive.
- **Loading/Error States:** Smooth handling of disruptions.

### UI/UX Highlights
- Responsive design for mobile, tablet, and desktop.
- Theme toggle (dark/light mode).
- Group management: create, add/remove members, member count display.

## Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/NoIdea2001/chat-app.git
   cd chat-app
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Copy `.env.local.example` to `.env.local`.
   - Add your Convex and Clerk keys.
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) to view the app.

## Tools Used
- **Next.js**: React framework for the web.
- **TypeScript**: Statically typed JavaScript.
- **Convex**: Backend for real-time apps.
- **Clerk**: Authentication as a service.
- **Tailwind CSS**: Utility-first CSS framework.

## Upcoming Features
- Advanced search for messages and users.
- Pinned message functionality.
- Enhanced read receipts.

## Contribution
Feel free to fork the repository, submit issues, and create pull requests to improve the application.