# Premium Call UI Design

## Overview

The call interface has been redesigned with a modern, premium aesthetic inspired by Discord, Telegram, and other leading communication platforms.

## Design Features

### 1. Visual Style

- **Dark gradient background**: Purple/indigo gradient with animated particles
- **Glassmorphism effect**: Blurred backdrop behind the call modal
- **Rounded corners**: 3xl rounded container for a modern feel
- **Large circular avatar**: 32x32 avatar with online indicator
- **Minimalist controls**: Clean circular buttons with smooth hover effects

### 2. Call States

#### Caller Side (Outgoing Call)
```
┌─────────────────────────┐
│  00:08            ✕     │  ← Timer & Close
│                         │
│         Calling...      │  ← Status
│      ┌───────┐          │
│      │   C   │          │  ← Large Avatar
│      │   ●   │          │     (with online dot)
│      └───────┘          │
│       cherk             │  ← Username
│     Connecting...       │  ← Status text
│                         │
│   🎤   📞   🔊          │  ← Controls
│  Mute  End  Speaker     │
└─────────────────────────┘
```

#### Receiver Side (Incoming Call)
```
┌─────────────────────────┐
│  00:08            ✕     │
│                         │
│    Incoming Audio Call  │
│      ┌───────┐          │
│      │   A   │          │
│      └───────┘          │
│       abdeo             │
│     Ringing...          │
│                         │
│   📞   🎤   📞          │
│ Decline Mute Accept     │
└─────────────────────────┘
```

### 3. Control Buttons

| Button | Icon | Color | Action |
|--------|------|-------|--------|
| Mute | 🎤 Mic/MicOff | White/Gray | Toggle microphone |
| End Call | 📞 PhoneOff | Red | Terminate call |
| Accept | 📞 Phone | Green | Answer incoming call |
| Decline | 📞 PhoneOff | Red | Reject incoming call |
| Speaker | 🔊 Volume2/VolumeX | White/Gray | Toggle speaker |

### 4. Status Indicators

- **Calling...**: Initial call state (caller side)
- **Ringing...**: Waiting for receiver to answer
- **Connecting...**: WebRTC connection being established
- **Connected**: Call is active (shows timer)
- **Incoming Audio Call...**: Receiver's incoming call screen

### 5. Color Palette

```css
Background Gradient:
  - from-indigo-900
  - via-purple-900
  - to-slate-900

Avatar Gradient:
  - from-purple-400
  - to-indigo-600

Buttons:
  - End/Decline: bg-red-500 hover:bg-red-600
  - Accept: bg-green-500 hover:bg-green-600
  - Mute/Speaker: bg-white/20 hover:bg-white/30
  - Active state: bg-white text-indigo-900

Text:
  - Primary: text-white
  - Secondary: text-white/60
  - Status badge: text-purple-400 / text-green-400 / text-teal-400
```

### 6. Animations

- **Fade in**: Modal appears smoothly
- **Pulse**: Avatar online indicator, active call dot
- **Hover scale**: Buttons grow slightly on hover
- **Gradient shift**: Background gradient slowly animates
- **Particle glow**: Three animated glow orbs in background

### 7. Header Integration

During active calls, the chat header shows:
- Call timer (font-mono, green)
- Pulsing green dot
- "On a call" status
- Red "End Call" button

### 8. Responsive Design

- Fixed modal size: 400px × 520px
- Centered on screen
- Works on desktop and tablet
- Touch-friendly button sizes (56-64px)

### 9. Accessibility

- Clear visual hierarchy
- High contrast text
- Large click targets
- Descriptive tooltips
- Keyboard navigation support

### 10. Technical Implementation

**Component**: `CallModal.jsx`

**Props**:
```javascript
{
  call: {
    isIncoming: boolean,
    caller_name: string,
    caller_avatar: string,
    status: string,
    type: string
  },
  callDuration: number,      // seconds
  isMuted: boolean,
  onAccept: () => void,
  onReject: () => void,
  onEnd: () => void,
  onToggleMute: () => void,
  error: string | null
}
```

**State Management**:
- Uses `useCall` hook for WebRTC
- Timer updates every second
- Real-time status updates via WebSocket

## Files Modified

1. `src/components/CallModal.jsx` - Complete redesign
2. `src/components/ChatHeader.jsx` - Added call timer & status
3. `src/components/ChatWindow.jsx` - Integrated new props
4. `src/index.css` - Added gradient animation

## Testing Checklist

- [ ] Audio call initiation
- [ ] Call acceptance
- [ ] Call rejection
- [ ] Mute/unmute toggle
- [ ] Speaker toggle
- [ ] Call timer counts up
- [ ] Connection status updates
- [ ] Error display
- [ ] Smooth animations
- [ ] Responsive layout

## Future Enhancements

- Video call UI with local/remote video feeds
- Screen sharing indicator
- Call quality indicator
- Bluetooth headset detection
- Noise cancellation toggle
- Call recording indicator
