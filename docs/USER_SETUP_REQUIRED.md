# VibeOverlay Studio – User Action Setup Guide

This document lists the required credentials, endpoints, and manual steps needed to connect the overlay components to real-world endpoints.

---

## 💜 Twitch Chat & Alerts

To replace mock chat data and mock alert messages with your active Twitch stream:

### 1. Register a Twitch Application
1. Go to the [Twitch Developer Console](https://dev.twitch.tv/console).
2. Click **Register Your Application**.
3. Name your app (e.g. `VibeOverlay-Studio`).
4. Set the **OAuth Redirect URL** to:
   `http://localhost:5173` (or your production domain).
5. Set the **Category** to **Application Integration**.
6. Copy the generated **Client ID** and **Client Secret**.

### 2. Generate User Access Tokens
* Use a tool like [Twitch Token Generator](https://twitchtokengenerator.com/) or configure an OAuth flow to request the following scopes:
  * `chat:read` (read stream chat messages)
  * `chat:write` (send chat messages back)
  * `bits:read` (read cheering events)
  * `channel:read:subscriptions` (read sub alerts)

### 3. Add to Environment Variables
```env
# Client-side configuration
VITE_TWITCH_CLIENT_ID=your_client_id_here
VITE_TWITCH_OAUTH_TOKEN=your_oauth_user_token_here
```

---

## 🎵 Spotify Music Player

To sync your current Spotify playback activity with the Music widget in real-time:

### 1. Register a Spotify Developer App
1. Log in to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Click **Create app**.
3. Set your Redirect URI to:
   `http://localhost:5173/api/auth/spotify/callback` (or your server authorization callback endpoint).
4. Save and copy the **Client ID** and **Client Secret**.

### 2. Request Authorization Scopes
* Direct user login through the authorization URL requesting:
  * `user-read-currently-playing`
  * `user-read-playback-state`

### 3. Add to Configuration
```env
# Server-side environment variables
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
```

---

## 🎮 OBS WebSocket Integration

To enable communication between the VibeOverlay editor dashboard and OBS Studio (e.g., to automatically hide or show sources when shifting scenes):

### 1. Enable WebSocket in OBS Studio
1. Open **OBS Studio**.
2. Go to **Tools** ➔ **WebSocket Server Settings**.
3. Check **Enable WebSocket Server**.
4. Set the server port to `4455` (default).
5. Click **Generate Password** (or view and copy the current password).

### 2. Configure Inside Integrations Tab
1. Open the VibeOverlay Studio dashboard and click the **Links** tab.
2. Under **OBS WebSocket (4455)**, enter:
   * **Host**: `localhost:4455` (or your streaming computer's local IP address if running the dashboard on a secondary computer/tablet).
   * **Password**: `your_obs_websocket_password_here`.
3. Click **Connect**.

---

## 🤖 OpenAI / Gemini AI Companion

To connect the VibeOverlay AI moderator companion to a real large language model (LLM) to execute dashboard commands:

### 1. Obtain API Key
* Go to the [OpenAI API Keys Dashboard](https://platform.openai.com/api-keys) or [Google AI Studio](https://aistudio.google.com/) and copy a valid API key.

### 2. Add to Environment Variables
```env
# Server-side API key (Never expose VITE prefix here to prevent client leak)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxx
# OR
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxx
```

---

## ⚡ Supabase Database Setup

To migrate the application settings from localStorage and enable multiplayer dashboard syncing:

### 1. Create a Supabase Project
1. Log in to the [Supabase Dashboard](https://supabase.com/).
2. Click **New Project** and name it.
3. Once provisioned, go to **Project Settings** ➔ **API**.
4. Copy the **Project URL** and the **Anon Public Key**.

### 2. Apply Database Migrations
1. Open the SQL Editor in Supabase.
2. Copy the contents of the `supabase_schema.sql` file from the workspace.
3. Paste and run the script to initialize tables, row-level security (RLS), and database publications for real-time synchronization.

### 3. Save Project Variables
Create a `.env` file at the root of the project:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxx
```
