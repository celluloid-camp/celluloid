# Custom PeerTube Player for React-Player

This document describes the custom PeerTube player implementation that replaces the forked `@celluloid/react-player` with the official `react-player` package.

## Overview

The custom PeerTube player component (`peertube-player.tsx`) implements react-player's custom player API to enable PeerTube video playback without requiring a fork of react-player.

## Architecture

### Components

1. **PeerTubePlayerComponent** (`apps/web/src/components/video-player/peertube-player.tsx`)
   - A React component that implements the `VideoElementProps` interface from react-player
   - Uses the [@peertube/embed-api](https://www.npmjs.com/package/@peertube/embed-api) for video playback
   - Handles all video player methods and events

2. **VideoPlayer** (`apps/web/src/components/video-player/index.tsx`)
   - Registers the custom PeerTube player using `ReactPlayer.addCustomPlayer()`
   - Wraps ReactPlayer and manages state through Zustand store

### Key Features

- **URL Detection**: Uses regex pattern `/^(https?):\/\/(.*)\/w\/(.*)$/` to detect PeerTube URLs
- **Event Handling**: Supports all standard player events (onPlay, onPause, onReady, onProgress, etc.)
- **Configuration**: Supports PeerTube-specific configuration options (controls, controlBar, peertubeLink, etc.)
- **Playback Control**: Implements play, pause, seek, volume control, and playback rate adjustment

## Implementation Details

### Player Registration

The custom player is registered with react-player using the `PlayerEntry` structure:

```typescript
const peertubePlayerEntry: PlayerEntry = {
  key: "peertube",
  name: "PeerTube",
  canPlay: PeerTubePlayerComponent.canPlay,
  player: PeerTubePlayerComponent,
};

ReactPlayer.addCustomPlayer(peertubePlayerEntry);
```

### URL Pattern Matching

PeerTube URLs follow the pattern: `https://<instance>/w/<video-id>`

Example: `https://peertube.example.com/w/abc123`

### Embed API Integration

The player loads the PeerTube Embed API from a CDN:
```typescript
const SDK_URL = "https://unpkg.com/@peertube/embed-api/build/player.min.js";
```

The API is loaded dynamically when a PeerTube video is played, avoiding unnecessary network requests for non-PeerTube videos.

### Configuration Options

The player supports PeerTube-specific configuration options through the `config.peertube` prop:

```typescript
<ReactPlayer
  url="https://peertube.example.com/w/abc123"
  config={{
    peertube: {
      controls: 1,          // Show player controls
      controlBar: 1,        // Show control bar
      peertubeLink: 0,      // Hide PeerTube link
      title: 0,             // Hide video title
      warningTitle: 0,      // Hide warning title
      p2p: 0,               // Disable P2P
      autoplay: 0,          // Disable autoplay
    },
  }}
/>
```

## Migration from Fork

### Before (Fork)
```typescript
import ReactPlayer from "@celluloid/react-player";
```

### After (Official + Custom Player)
```typescript
import ReactPlayer from "react-player";
// Custom player is automatically registered
```

### Benefits

1. **Official Package**: Uses the maintained react-player package
2. **Easier Updates**: No need to maintain a fork or merge upstream changes
3. **Smaller Bundle**: Only loads PeerTube API when needed
4. **Type Safety**: Proper TypeScript types from react-player
5. **Future-Proof**: Compatible with future react-player versions

## Testing

To test the custom player:

1. Ensure the web app is running: `pnpm dev`
2. Navigate to a project with a PeerTube video
3. Verify that:
   - Video loads and plays correctly
   - Controls (play, pause, seek) work
   - Progress updates are accurate
   - Volume control works
   - Playback rate adjustment works

## Troubleshooting

### Player Not Loading

If PeerTube videos don't load, check the browser console for warnings:
- "ReactPlayer.addCustomPlayer is not available" - The react-player version may not support custom players
- Network errors - The PeerTube Embed API CDN may be blocked

### TypeScript Errors

If you encounter TypeScript errors related to the player:
1. Ensure react-player is properly installed: `pnpm install`
2. Check that VideoElementProps is imported correctly
3. Verify that the PlayerEntry structure matches the installed react-player version

## References

- [React Player Documentation](https://github.com/CookPete/react-player)
- [React Player Custom Players Guide](https://thedocs.io/react-player/guides/custom_players/)
- [PeerTube Embed API](https://docs.joinpeertube.org/api-embed-player)
- [Original Fork](https://github.com/celluloid-camp/react-player)
