# Dynamic Scheduler - LearnLog Feature

## Overview
The Dynamic Scheduler is a comprehensive study planning tool that helps users create and manage study sessions with intelligent daily video allocation. It integrates seamlessly with the existing playlist system to provide smart scheduling based on video counts and time constraints.

## Features

### 🎯 **Smart Session Creation**
- **Playlist Integration**: Select from existing YouTube or manual playlists
- **Auto-Calculation**: Automatically calculates daily video targets based on total videos and study period
- **Real-time Preview**: See session details before creating
- **Date Validation**: Ensures logical start/end dates

### 📅 **Dual View Modes**
- **List View**: Card-based layout showing all sessions with progress
- **Calendar View**: Interactive calendar with session indicators and daily task management

### 📊 **Progress Tracking**
- **Visual Progress Bars**: Real-time completion percentage
- **Status Management**: Active, Completed, Cancelled states
- **Daily Completion**: Mark individual days as completed or missed
- **Smart Recalculation**: Automatically adjusts daily targets when days are missed

### 🎨 **Consistent UI/UX**
- **Dark Theme**: Matches existing learnLog design
- **Transparent Cards**: Clean, minimal interface
- **Hover Effects**: Subtle interactions for better UX
- **Responsive Design**: Works on all screen sizes

## API Endpoints

### Backend Routes
- `POST /api/scheduler/session` - Create new study session
- `GET /api/scheduler/sessions/:userId` - Fetch user's sessions
- `PUT /api/scheduler/session/:id` - Update session
- `DELETE /api/scheduler/session/:id` - Delete session
- `POST /api/scheduler/session/:id/complete-day` - Mark day as completed
- `POST /api/scheduler/session/:id/miss-day` - Mark day as missed

### Frontend Routes
- `/scheduler` - Main Dynamic Scheduler page

## How to Use

### Creating a Study Session
1. Navigate to **Dynamic Scheduler** from the main menu
2. Click the **+** button to create a new session
3. Select a playlist from the dropdown
4. Enter a session name
5. Set start and end dates
6. Review the auto-calculated daily allocation
7. Click **Create Session**

### Managing Sessions
- **Edit**: Click the edit icon on any session card
- **Delete**: Click the delete icon (with confirmation)
- **View Progress**: See completion percentage and remaining days
- **Complete Day**: In calendar view, click the checkmark to mark a day complete

### Calendar View
- Toggle to **Calendar View** to see sessions across time
- Days with active sessions show green indicators
- Click on any date to see scheduled sessions
- Mark days as completed directly from the calendar

## Technical Implementation

### Database Schema
```javascript
StudySession {
  userId: ObjectId (ref: User)
  playlistId: ObjectId (ref: Playlist)
  sessionName: String
  startDate: Date
  endDate: Date
  dailyAllocation: Number
  status: enum ['active', 'completed', 'cancelled']
  completedDays: Array
  missedDays: Array
}
```

### Smart Allocation Logic
```javascript
dailyAllocation = Math.ceil(totalVideos / remainingDays)
```

### Key Components
- **DynamicScheduler.jsx**: Main component with dual view modes
- **StudySession Model**: MongoDB schema with virtuals and methods
- **Scheduler Controller**: Backend logic for CRUD operations
- **Date Picker Integration**: MUI X Date Pickers for calendar functionality

## Dependencies Added
- `@mui/x-date-pickers`: Calendar component
- `date-fns`: Date manipulation utilities

## Integration Points
- **Playlist System**: Uses existing playlist data for video counts
- **Authentication**: Protected routes with JWT
- **Navigation**: Integrated into main app navigation
- **Theme**: Consistent with existing dark theme

## Future Enhancements
- **Recurring Sessions**: Weekly/monthly study patterns
- **Study Reminders**: Email/notification system
- **Analytics**: Detailed progress reports
- **Study Groups**: Collaborative scheduling
- **Mobile App**: Native mobile experience

## Usage Examples

### Example Session Creation
```javascript
{
  playlistId: "507f1f77bcf86cd799439011",
  sessionName: "GATE Preparation - Week 1",
  startDate: "2024-01-15",
  endDate: "2024-01-21"
}
// Auto-calculates: 4 videos per day for 7 days
```

### Example Response
```javascript
{
  success: true,
  data: {
    sessionName: "GATE Preparation - Week 1",
    dailyAllocation: 4,
    remainingDays: 7,
    progressPercentage: 0,
    status: "active"
  }
}
```

The Dynamic Scheduler transforms the way users plan their learning journey, providing intelligent scheduling that adapts to their progress and helps maintain consistent study habits.
