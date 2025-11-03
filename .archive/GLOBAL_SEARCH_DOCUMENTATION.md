# Global Search Implementation Documentation

## Overview

The mentorship platform includes a real-time global search feature that allows users to search across multiple entity types (users, events, resources, and messages) from a unified search bar in the navbar. Results are displayed in an organized, categorized dropdown with instant navigation.

## Architecture

### Backend Stack

- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT token validation (middleware)
- **Search Scope**: Case-insensitive substring matching across all entity types

### Frontend Stack

- **Framework**: React 18 with TypeScript
- **Component**: `GlobalSearch` in navbar (UI component)
- **Service**: `searchService` (API integration)
- **HTTP Client**: Fetch API with token-based authentication
- **Debounce**: 300ms delay to prevent excessive API calls

## Implementation Details

### 1. Backend - Search Controller

**File**: `backend/src/controllers/searchController.ts`

The search controller handles all search logic:

```typescript
export const search = async (req: AuthRequest, res: Response)
```

**Features**:

- Case-insensitive substring search using Prisma's `mode: 'insensitive'`
- Results limited to 5 items per category to keep responses manageable
- Filters:
  - **Users**: Only active users (isActive: true), searches firstName, lastName, email
  - **Events**: Searches title and description, no status filter
  - **Resources**: Searches title and description, includes user/creator info
  - **Messages**: Only from current user's conversations (senderId or receiverId matches)

**Response Structure**:

```json
{
  "users": [
    {
      "id": "uuid",
      "firstName": "string",
      "lastName": "string",
      "email": "string",
      "role": "MENTOR" | "MENTEE" | "ADMIN",
      "avatar": "url | null"
    }
  ],
  "events": [
    {
      "id": "uuid",
      "title": "string",
      "description": "string",
      "startTime": "ISO timestamp",
      "endTime": "ISO timestamp",
      "location": "string | null"
    }
  ],
  "resources": [
    {
      "id": "uuid",
      "title": "string",
      "description": "string | null",
      "url": "string | null",
      "type": "string",
      "createdAt": "ISO timestamp",
      "user": {
        "id": "uuid",
        "firstName": "string",
        "lastName": "string",
        "avatar": "url | null"
      }
    }
  ],
  "messages": [
    {
      "id": "uuid",
      "content": "string",
      "createdAt": "ISO timestamp",
      "sender": {
        "id": "uuid",
        "firstName": "string",
        "lastName": "string",
        "avatar": "url | null"
      },
      "receiver": {
        "id": "uuid",
        "firstName": "string",
        "lastName": "string",
        "avatar": "url | null"
      }
    }
  ]
}
```

**Authentication**: Protected route - requires valid JWT token in `Authorization: Bearer <token>` header

### 2. Backend - Search Routes

**File**: `backend/src/routes/searchRoutes.ts`

Simple route definition:

```typescript
GET /api/search?q={query}
```

Requires:

- Query parameter: `q` (search string)
- Authentication: JWT token

### 3. Backend - Server Integration

**File**: `backend/src/server.ts`

Search routes are registered at:

```typescript
import searchRoutes from "./routes/searchRoutes";
app.use("/api/search", authenticate, searchRoutes);
```

### 4. Frontend - Search Service

**File**: `frontend/src/services/searchService.ts`

Provides API integration layer with TypeScript interfaces:

```typescript
export const performSearch = async (query: string): Promise<SearchResults>
```

**Features**:

- Automatic token retrieval from token manager
- Error handling with graceful fallback (returns empty results)
- Request structure:
  - URL: `http://localhost:5000/api/search?q={query}`
  - Method: GET
  - Headers: Authorization Bearer token + Content-Type JSON

**Type Definitions**:

```typescript
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  avatar?: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location?: string;
}

interface Resource {
  id: string;
  title: string;
  description?: string;
  url?: string;
  type: string;
  createdAt: string;
  user: User;
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: User;
  receiver?: User;
}

interface SearchResults {
  users: User[];
  events: Event[];
  resources: Resource[];
  messages: Message[];
}
```

### 5. Frontend - Global Search Component

**File**: `frontend/src/components/ui/GlobalSearch.tsx`

Main UI component integrated into navbar with 240+ lines of React/Tailwind code.

**Features**:

- **Debounced Input**: 300ms delay before making API request
- **Loading Indicator**: Animated spinner while searching
- **Click Outside Detection**: Closes dropdown when clicking outside
- **Keyboard Navigation**: Input focus via ref
- **Result Categorization**: 4 separate sections (Users, Events, Resources, Messages)
- **Empty State**: Shows message when no results found
- **Dark Mode Support**: Full dark mode styling with Tailwind classes

**Layout**:

```
┌─ Search Input with magnifying glass icon
│
└─ Results Dropdown (when search term + results exist)
   ├─ Users Section
   │  └─ User rows (avatar, name, email, role badge)
   ├─ Events Section
   │  └─ Event rows (calendar icon, title, date, location)
   ├─ Resources Section
   │  └─ Resource rows (file icon, title, creator, date)
   └─ Messages Section
      └─ Message rows (message preview, sender, timestamp)
```

**Result Item Structure**:

- Each result is clickable
- On click: navigates to relevant page
- Clears search term and closes dropdown after navigation
- Hover effect with background color change

**User Navigation**: `/users/{userId}`
**Event Navigation**: `/events` with state `{ eventId, fromSearch: true }`
**Message Navigation**: `/messages` with state `{ userId: sender.id, fromSearch: true }`

**Styling**:

- Responsive: `max-w-md` on search input
- Dropdown: `max-h-96` with scroll on overflow
- Icons: Lucide React icons (User, Calendar, MessageCircle, etc.)
- Colors: Primary color scheme with brand styling

## Data Flow Diagram

```
User types in Search Input
        ↓
[300ms debounce]
        ↓
performSearch() called with query string
        ↓
Backend receives GET /api/search?q={query}
        ↓
searchController.search() executes 4 Prisma queries in parallel:
  ├─ Users: case-insensitive firstName, lastName, email search
  ├─ Events: case-insensitive title, description search
  ├─ Resources: case-insensitive title, description search
  └─ Messages: case-insensitive content search (user's messages only)
        ↓
All results limited to 5 per category
        ↓
Response returned as JSON: { users, events, resources, messages }
        ↓
React state updated with results
        ↓
GlobalSearch component renders results by category
        ↓
User clicks a result
        ↓
navigate() called with appropriate route/state
```

## Search Algorithm

**Case-Insensitive Substring Matching**:

- Prisma `mode: 'insensitive'` converts both DB values and search query to lowercase
- Substring matching: "john" matches "John Smith", "john@example.com", etc.
- Searches 1-3 fields per entity type for relevance

**Filtering Logic**:

- Users: Only active (isActive: true)
- Events: All events (no status filter)
- Resources: All resources
- Messages: Only messages where current user is sender or receiver

**Performance**:

- Database indexes on searchable fields (firstName, lastName, email, title, content)
- Limited to 5 results per category (hardcoded limit in controller)
- Case-insensitive search handled by database (efficient)
- Debounce on frontend (prevents excessive requests)

## Search Scope

### Users Search

- **Fields**: firstName, lastName, email
- **Filter**: isActive: true
- **Returns**: User profile data (no sensitive fields)
- **Use Case**: Find mentors, mentees, other users

### Events Search

- **Fields**: title, description
- **Filter**: None (all events)
- **Returns**: Event details (time, location)
- **Use Case**: Find upcoming/past events

### Resources Search

- **Fields**: title, description
- **Filter**: None (all resources)
- **Returns**: Resource data with creator info
- **Use Case**: Find learning materials, documents

### Messages Search

- **Fields**: content
- **Filter**: Only messages in current user's conversations
- **Returns**: Message text, sender/receiver, timestamp
- **Use Case**: Find previous conversations, specific messages

## Security Considerations

1. **Authentication Required**: All search requests must include valid JWT token
2. **User Isolation**: Messages search restricted to current user's conversations
3. **Data Selection**: Only necessary fields returned (no passwords, sensitive data)
4. **Query Sanitization**: Prisma parameterized queries prevent SQL injection
5. **Rate Limiting**: None implemented yet (future enhancement)

## Testing

### Manual Testing

1. **User Search**:

   ```
   Search: "john"
   Expected: Shows all users with "john" in firstName, lastName, or email
   ```

2. **Event Search**:

   ```
   Search: "mentoring"
   Expected: Shows events with "mentoring" in title or description
   ```

3. **Resource Search**:

   ```
   Search: "react"
   Expected: Shows resources about React with creator info
   ```

4. **Message Search**:

   ```
   Search: "lunch"
   Expected: Shows messages containing "lunch" from current user's conversations
   ```

5. **Empty Results**:
   ```
   Search: "xyz123abc"
   Expected: Shows "No results found" message
   ```

### API Testing

```bash
# With authentication token
curl -X GET "http://localhost:5000/api/search?q=john" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"

# Response:
{
  "users": [...],
  "events": [...],
  "resources": [...],
  "messages": [...]
}
```

## Performance Optimization Opportunities

1. **Add Pagination**: Currently limited to 5 results per category

   - Implementation: Add `skip` and `take` parameters to Prisma queries
   - Frontend: Add "Load More" button for each category

2. **Add Filtering**: Currently searches all entity types

   - Implementation: Add `type` query parameter (users, events, resources, messages)
   - Frontend: Add filter buttons in dropdown

3. **Fuzzy Search**: Currently exact substring matching

   - Implementation: Use full-text search (PostgreSQL `tsvector`)
   - Benefit: Match misspellings, partial words

4. **Search History**: Cache recent searches

   - Implementation: Store in localStorage or database
   - Frontend: Show quick access for common searches

5. **Search Suggestions**: Autocomplete suggestions

   - Implementation: Separate endpoint for popular search terms
   - Frontend: Show suggestions while typing

6. **Rate Limiting**: Prevent search abuse
   - Implementation: Add rate limiter middleware
   - Configuration: e.g., 100 requests per minute per user

## Future Enhancements

1. **Advanced Filters**:

   - Filter by date range (events)
   - Filter by role (users)
   - Filter by resource type
   - Filter by message participant

2. **Search Sorting**:

   - Sort by relevance (match position in text)
   - Sort by date (most recent first)
   - Sort by popularity (interaction count)

3. **Search Analytics**:

   - Track popular searches
   - Identify missing content
   - Improve search suggestions

4. **Multi-Language Support**:

   - Search across different character sets
   - Transliteration for non-Latin scripts

5. **Advanced Search Syntax**:
   - Boolean operators: AND, OR, NOT
   - Exact phrase matching: "exact phrase"
   - Field-specific search: user:john events:mentoring

## Troubleshooting

### No results showing

1. Verify backend server is running (`npm run dev` in backend folder)
2. Check network tab in browser DevTools for API request
3. Verify JWT token is valid
4. Check backend console for errors

### Search returns 404 error

1. Verify search routes are registered in server.ts
2. Check route path matches: `/api/search`
3. Verify authenticate middleware is applied

### Results loading slowly

1. Check database connection
2. Review Prisma query performance (check console logs)
3. Consider adding database indexes
4. Check network latency

### Specific entity type not searching

1. Verify Prisma schema has the field being searched
2. Check searchController.ts for the search query
3. Verify filtering conditions (e.g., isActive for users)

## Code Files Reference

| File                                          | Purpose           | Lines |
| --------------------------------------------- | ----------------- | ----- |
| `backend/src/controllers/searchController.ts` | Main search logic | 132   |
| `backend/src/routes/searchRoutes.ts`          | Route definition  | 11    |
| `frontend/src/services/searchService.ts`      | API integration   | 79    |
| `frontend/src/components/ui/GlobalSearch.tsx` | UI component      | 246   |

## Environment Variables

No additional environment variables required for search. Uses existing:

- `VITE_API_URL` (frontend): API base URL
- Authentication: Existing JWT system

## Dependencies

- **Backend**: `prisma`, `express` (no new dependencies)
- **Frontend**: `lucide-react` (icons), `react-router-dom` (navigation) - already installed

## Related Features

- **Authentication**: Uses existing JWT auth middleware
- **User Profiles**: Link to `/users/{userId}`
- **Events**: Link to `/events` page
- **Messaging**: Link to `/messages` page
- **Resources**: Part of resources feature

## Changelog

- **November 2, 2025**: Initial implementation
  - Added searchController.ts with 4-entity search
  - Added searchRoutes.ts with protected route
  - Created searchService.ts with TypeScript interfaces
  - Implemented GlobalSearch.tsx component with debouncing
  - Integrated search bar into navbar
  - All code compiles without errors ✅
