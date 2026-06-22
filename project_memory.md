# VibeOverlay Studio - Project Memory

## Project Vision

VibeOverlay Studio is NOT just an overlay website.

The long-term goal is to build a complete streaming operating system combining:

* StreamElements
* Streamlabs
* Stream Deck
* Overlay systems
* OBS companion tools
* VTuber companion tools

into one ecosystem.

This should eventually become a SaaS platform.

---

# Current Tech Stack

Frontend:

* React
* TypeScript
* Tailwind
* Framer Motion
* Zustand

Future Backend:

* Supabase
* Postgres
* Realtime
* Row Level Security
* Edge Functions

---

# Existing UI

The current cyberpunk purple UI is already built.

DO NOT redesign or replace the visual style.

Preserve:

* Sidebars
* Panels
* Purple gradients
* Glassmorphism
* Neon effects
* Existing layouts

Focus on functionality.

---

# Architecture

Admin:

/

Contains:

* Scene controller
* Theme
* Goals
* AI companion
* Event simulator
* Settings
* Timer controls

OBS:

/obs

OBS mode must contain ONLY overlays.

No:

* sidebar
* controls
* AI
* dashboard panels

---

# Scene Types

Starting Soon

Main Stream

Chat Session

BRB

Ending Stream

Scenes should be independent components.

---

# Widgets

Widgets are reusable.

Current widgets:

Chat

Music

Timer

Goals

Alerts

Ticker

Viewer Count

Socials

Avatar

Events

Widgets should never contain duplicated logic.

---

# Global State

Use Zustand.

`overlayStore.ts`

Contains:

* `currentScene`
* `timer`
* `music`
* `chatMessages`
* `latestFollower`
* `latestSubscriber`
* `latestDonation`
* `viewerCount`
* `theme`
* `socials`
* `showChat`
* `showAvatar`
* `showTicker`
* `subGoal`
* `donationGoal`
* `followerGoal`
* `streamTitle`
* `settings`

All components should consume global state.

---

# Backend Strategy

Current:

* Local state (synchronized in real-time between admin and overlay views using a lightweight `localStorage` event-broadcast layer).

Future:

* Supabase Realtime

All architecture should be built with future realtime synchronization in mind.

Avoid designs that would require major rewrites.

---

# Database Tables

* `users`
* `scenes`
* `widgets`
* `timers`
* `goals`
* `events`
* `chat_messages`
* `music`
* `themes`
* `socials`
* `schedules`
* `ai_commands`
* `theme_downloads`
* `theme_reviews`
* `theme_categories`

---

# Realtime Events

* Timer updates.
* Scene switching.
* Chat messages.
* Alerts.
* Goals.
* Viewer count.

Everything should support live synchronization.

---

# Integrations

Future integrations:

* YouTube
* Twitch
* Kick
* Spotify
* Discord
* OBS WebSocket
* Social Stream Ninja
* StreamElements
* Streamlabs

Do not tightly couple code to one platform.

---

# AI Companion

AI Companion is not fake.

Commands should manipulate global state.

Examples:

* Switch to BRB
* Add 5 minutes
* Hide chat
* Hide avatar
* Switch to gameplay
* Enable cyber theme

---

# Scheduler

Future scheduler should support:

* 8:00 PM → Starting Soon
* 8:15 PM → Main Stream
* 10:00 PM → BRB
* 10:05 PM → Main Stream
* 11:30 PM → Ending

Automatic scene transitions.

---

# Marketplace

Future support:

* Themes
* Widgets
* Templates
* Downloads
* Reviews
* Categories

---

# Important Rules

* DO NOT redesign the UI.
* DO NOT generate placeholder widgets.
* DO NOT create duplicate components.
* DO NOT tightly couple to localStorage.
* DO build reusable components.
* DO prepare architecture for Supabase Realtime.
* DO preserve existing design.
* DO think like a SaaS product rather than a prototype.
