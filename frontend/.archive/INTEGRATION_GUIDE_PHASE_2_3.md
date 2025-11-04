# Integration Guide: Phases 2 & 3 to Your App

**Quick integration steps to add messaging to your application**

---

## Step 1: Frontend Dependencies

```bash
cd frontend
npm install socket.io-client axios react-icons
```

Verify in `package.json`:

```json
{
  "dependencies": {
    "socket.io-client": "^4.7.0",
    "axios": "^1.6.0",
    "react-icons": "^4.12.0"
  }
}
```

---

## Step 2: Add Environment Variables

**Frontend**: `frontend/.env.local`

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

**Backend**: Already configured (socket.io running on :5000)

---

## Step 3: Setup WebSocket Connection

In `frontend/src/App.tsx` or main layout:

```tsx
import { useEffect } from 'react';
import { messagingService } from './services/messagingService';
import { useAuth } from './hooks/useAuth';

function App() {
  const { user } = useAuth();

  useEffect(() => {
    if (user && localStorage.getItem('token')) {
      const token = localStorage.getItem('token')!;
      messagingService.connectWebSocket(token);

      return () => {
        messagingService.disconnectWebSocket();
      };
    }
  }, [user]);

  return (
    // Your app routes
  );
}

export default App;
```

---

## Step 4: Add Route

In `frontend/src/main.tsx` or router configuration:

```tsx
import { MessagesPage } from "./components/messaging";

const routes = [
  // ... existing routes
  {
    path: "/messages",
    element: <MessagesPage />,
    name: "Messages",
  },
];
```

Or with React Router v6:

```tsx
import { MessagesPage } from "./components/messaging";

<Route path="/messages" element={<MessagesPage />} />;
```

---

## Step 5: Add Navigation Link

In your navigation/sidebar component:

```tsx
import { Link } from "react-router-dom";
import { HiOutlineChat } from "react-icons/hi";

export function Navigation() {
  return (
    <nav>
      {/* ... other links */}
      <Link
        to="/messages"
        className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded"
      >
        <HiOutlineChat className="w-5 h-5" />
        <span>Messages</span>
      </Link>
    </nav>
  );
}
```

---

## Step 6: Configure Tailwind CSS (if not already done)

In `frontend/tailwind.config.js`:

```js
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

---

## Step 7: Update API Axios Configuration

If you have a custom axios instance, ensure it includes auth header:

```tsx
// frontend/src/services/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Add auth token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

---

## Step 8: Backend - Verify Routes are Registered

Check `backend/src/server.ts`:

```typescript
import contactRoutes from "./routes/contactRoutes";
import conversationRoutes from "./routes/conversationRoutes";
import directMessageRoutes from "./routes/directMessageRoutes";

// ... in app setup:
app.use("/api/contacts", authenticateToken, contactRoutes);
app.use("/api/conversations", authenticateToken, conversationRoutes);
app.use("/api/direct-messages", authenticateToken, directMessageRoutes);
```

---

## Step 9: Verify Database Migration Applied

```bash
cd backend

# Check migration status
npx prisma migrate status

# If needed, apply migration
npx prisma migrate deploy
```

---

## Step 10: Start Services

**Terminal 1 - Backend**:

```bash
cd backend
npm run dev
# Server running on http://localhost:5000
```

**Terminal 2 - Frontend**:

```bash
cd frontend
npm run dev
# App running on http://localhost:5173
```

---

## Testing the Integration

### Manual Testing Steps

1. **Open App**: Go to `http://localhost:5173`
2. **Login**: Use test account
3. **Navigate to Messages**: Click Messages in navigation
4. **View Contacts**: Should see auto-populated contacts from groups
5. **Start Conversation**: Click a contact to create/open conversation
6. **Send Message**: Type message and press Send
7. **Real-time Test**: Open in another browser tab/window, send message back
8. **Verify Real-time**: Message appears instantly without page reload

### Testing Specific Features

#### Real-time Messaging

- Open conversation in 2 windows
- Send message from window 1
- Should appear instantly in window 2 (< 50ms)

#### Typing Indicator

- Start typing in message input
- Should see "typing..." in other window
- Stop typing and see it disappear

#### Online Status

- Check online status indicator
- When disconnected (close tab), should show offline in other window

#### Auto-populated Contacts

- Create group with mentor + mentees
- Mentees should see mentor + other mentees in contacts
- Mentor should see all mentees in contacts

---

## Troubleshooting

### WebSocket Not Connecting

**Error**: `WebSocket connection failed`

**Solution**:

1. Verify backend running: `curl http://localhost:5000`
2. Check token: `localStorage.getItem('token')`
3. Check browser console for errors
4. Verify `VITE_SOCKET_URL` environment variable

### Messages Not Sending

**Error**: `Failed to send message`

**Solution**:

1. Check WebSocket connection: `messagingService.isConnected()`
2. Verify conversation exists
3. Check console for validation errors
4. Verify both users are not blocked

### Components Not Rendering

**Error**: `Cannot find module 'react-icons/fi'`

**Solution**:

```bash
cd frontend
npm install react-icons
npm run dev
```

### CORS Issues

**Error**: `Access to XMLHttpRequest blocked by CORS`

**Solution**:
In `backend/src/server.ts`:

```typescript
import cors from "cors";

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
```

---

## Advanced Configuration

### Socket.IO Options

Modify in `backend/src/server.ts`:

```typescript
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
  pingInterval: 25000,
  pingTimeout: 60000,
  maxHttpBufferSize: 1e6, // 1MB
});
```

### Message Pagination

In `ChatWindow.tsx`, implement infinite scroll:

```tsx
const [offset, setOffset] = useState(0);

const handleLoadMore = async () => {
  const newMessages = await messagingService.getMessages(
    conversationId,
    50,
    offset + 50
  );
  setMessages([...newMessages, ...messages]);
  setOffset(offset + 50);
};
```

### Disable Console Logs (Production)

In `messagingService.ts`:

```typescript
const isDev = import.meta.env.DEV;

const log = (...args: any[]) => {
  if (isDev) console.log(...args);
};
```

---

## Deployment Considerations

### Before Going Live

1. **Regenerate Prisma Client**:

   ```bash
   cd backend
   npx prisma generate
   ```

2. **Build Frontend**:

   ```bash
   cd frontend
   npm run build
   ```

3. **Test Build Output**:

   ```bash
   npm run preview
   ```

4. **Environment Variables**:

   - Set `VITE_API_URL` to production API endpoint
   - Set `VITE_SOCKET_URL` to production server
   - Ensure CORS configured for production domain

5. **Database**:

   - Run migrations on production database
   - Backup existing data

6. **Rate Limiting** (Optional):

   ```typescript
   import rateLimit from 'express-rate-limit';

   const messageLimiter = rateLimit({
     windowMs: 60 * 1000, // 1 minute
     max: 100 // 100 messages per minute
   });

   app.post('/api/direct-messages', messageLimiter, ...);
   ```

---

## Monitoring & Logging

### Enable Activity Logging

In `messagingService.ts`:

```typescript
const isDev = import.meta.env.DEV;

connectWebSocket(token: string) {
  if (isDev) console.log('Connecting WebSocket...');
  // ...
  this.socket!.on('message:new', (data) => {
    if (isDev) console.log('Message received:', data);
    this.emit('message:new', data);
  });
}
```

### Monitor WebSocket Health

In `backend/src/websocket/index.ts`:

```typescript
io.on("connection", (socket: Socket) => {
  console.log(`[${new Date().toISOString()}] User connected: ${userId}`);

  socket.on("disconnect", () => {
    console.log(`[${new Date().toISOString()}] User disconnected: ${userId}`);
  });
});
```

---

## Performance Optimization

### Message Caching

```typescript
const messageCache = new Map<string, DirectMessage[]>();

export async function getMessages(conversationId: string) {
  if (messageCache.has(conversationId)) {
    return messageCache.get(conversationId)!;
  }

  const messages = await messagingService.getMessages(conversationId);
  messageCache.set(conversationId, messages);
  return messages;
}
```

### Debounce Typing Indicator

```typescript
import { debounce } from "lodash-es";

const debouncedTyping = debounce((conversationId: string) => {
  messagingService.typingStart(conversationId);
}, 300);

// In input onChange
const handleInputChange = (value: string) => {
  setInputValue(value);
  debouncedTyping(currentConversation.id);
};
```

---

## Next Steps

1. ✅ Install dependencies
2. ✅ Add environment variables
3. ✅ Setup WebSocket connection
4. ✅ Add route to router
5. ✅ Add navigation link
6. ✅ Test basic functionality
7. ✅ Deploy to staging
8. ✅ Full user testing
9. ✅ Deploy to production
10. ✅ Monitor and optimize

---

## Support & Resources

### Files Reference

- Backend: `/backend/src/websocket/messageHandlers.ts`
- Backend: `/backend/src/controllers/contactController.ts`
- Frontend: `/frontend/src/services/messagingService.ts`
- Frontend: `/frontend/src/hooks/useMessaging.ts`
- Components: `/frontend/src/components/messaging/`

### Documentation

- Full Phase 2 & 3: `PHASE_2_3_COMPLETE.md`
- API Reference: `MESSAGING_API_REFERENCE.md`
- Implementation Plan: `MESSAGING_SYSTEM_IMPLEMENTATION_PLAN.md`

### Questions?

Refer to the comprehensive documentation files for detailed information about architecture, API endpoints, and advanced usage.

---

**Your messaging system is ready to deploy!** 🚀
