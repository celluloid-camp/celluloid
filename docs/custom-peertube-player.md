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
   - Wraps ReactPlayer with custom Material UI controls
   - Manages state through Zustand store
   - Provides rich UI controls with auto-hiding behavior

### Material UI Custom Controls

The video player now features a fully custom control bar built with Material UI components:

**Features:**
- **Play/Pause Button**: Material UI IconButton with PlayArrow/Pause icons
- **Skip Controls**: FastForward/FastRewind buttons for 10-second jumps
- **Volume Control**: Slider with mute toggle (VolumeUp/VolumeOff icons)
- **Seek Bar**: Material UI Slider for timeline navigation with time display (MM:SS format)
- **Subtitle Toggle**: ClosedCaption button to show/hide subtitles (only visible when video has text tracks)
- **Fullscreen Toggle**: Enter/exit fullscreen mode
- **Auto-hide Behavior**: Controls automatically fade out after 3 seconds of inactivity when playing
- **Responsive Design**: Gradient overlay background for better visibility

**Subtitle Support:**
- Automatically detects if video has text tracks (subtitles/captions)
- Shows ClosedCaption icon when subtitles are enabled, ClosedCaptionDisabled when disabled
- Button only appears when subtitles are available
- Toggles the first available text track on/off

**Styling:**
- Consistent with Material UI theme
- White icons on dark gradient background
- Smooth opacity transitions
- Primary color for seek bar

### Key Features

- **URL Detection**: Uses regex pattern `/(https?):\/\/([^/]+)\/(?:videos\/watch|w)\/(.+)$/` to detect PeerTube URLs
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

PeerTube URLs follow multiple patterns (v3.3+):
- **Short format**: `https://<instance>/w/<video-id>`
- **Full format**: `https://<instance>/videos/watch/<video-id>`

Both formats are supported and converted to the embed URL format: `https://<instance>/videos/embed/<video-id>`

Examples: 
- `https://peertube.example.com/w/abc123`
- `https://peertube.example.com/videos/watch/abc123`
- `https://framatube.org/w/9c9de5e8-0a1e-484a-b099-e80766180a6d`
- `https://framatube.org/videos/watch/9c9de5e8-0a1e-484a-b099-e80766180a6d`

### Embed API Integration

The player loads the PeerTube Embed API from a CDN:
```typescript
const SDK_URL = "https://unpkg.com/@peertube/embed-api/build/player.min.js";
```

The API is loaded dynamically when a PeerTube video is played, avoiding unnecessary network requests for non-PeerTube videos. The implementation includes protection against multiple concurrent loading attempts, ensuring the SDK is loaded only once even if multiple players are initialized simultaneously.

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
