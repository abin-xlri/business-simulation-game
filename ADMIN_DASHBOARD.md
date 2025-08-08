# Admin Dashboard Documentation

## Overview

The Admin Dashboard is a comprehensive management interface for the business simulation game that provides administrators with full control over sessions, real-time monitoring, scoring, and behavioral analysis.

## Features

### 1. Session Management
- **View All Sessions**: See all active and completed simulation sessions
- **Session Control**: Start, pause, and complete sessions
- **Round Management**: Advance rounds and control game flow
- **Participant Overview**: View participant counts and session details

### 2. Real-time Monitoring
- **Live Status Grid**: Real-time participant status for all tasks
- **Completion Rates**: Visual progress bars for each task type
- **Task Status**: Individual completion status for each participant
- **Group Formation**: Monitor group activities and collaboration

### 3. Scoring Dashboard
- **Auto-calculation**: Automatic score calculation for all tasks
- **Overall Rankings**: Complete leaderboard with total scores
- **Task Breakdown**: Individual scores for each task type
- **CSV Export**: Export results for external analysis

### 4. Timer Controls
- **Global Timer Sync**: Synchronized timers across all participants
- **Task-specific Controls**: Individual timer control for each task
- **Override Capabilities**: Admin can pause, reset, or extend timers
- **Broadcast Updates**: Real-time timer updates to all participants

### 5. Announcement System
- **Broadcast Messages**: Send announcements to all participants
- **Message Types**: Info, warning, success, and error messages
- **Real-time Delivery**: Instant message delivery via WebSocket

### 6. Behavioral Indicators
- **Participation Analysis**: Track participant engagement levels
- **Leadership Assessment**: Identify natural leaders in groups
- **Collaboration Scoring**: Measure teamwork effectiveness
- **Communication Metrics**: Track message frequency and quality

## API Endpoints

### Session Management
```
GET    /api/admin/sessions                    # Get all sessions
PATCH  /api/admin/sessions/:id/status         # Update session status
POST   /api/admin/sessions/:id/force-submit   # Force submit task for user
```

### Real-time Monitoring
```
GET    /api/admin/sessions/:id/status         # Get session status and completion rates
```

### Scoring Dashboard
```
GET    /api/admin/sessions/:id/scores         # Calculate and get scores
GET    /api/admin/sessions/:id/export         # Export results as CSV
```

### Timer Controls
```
POST   /api/admin/sessions/:id/timer          # Update global timer
```

### Announcements
```
POST   /api/admin/sessions/:id/announcement   # Broadcast announcement
```

### Behavioral Analysis
```
GET    /api/admin/sessions/:id/behavioral-indicators  # Get behavioral data
```

## Database Models

### Session Management
- `Session`: Core session data with status and round information
- `UserSession`: Participant-session relationships
- `RouteCalculation`: Round 1 Task 1 submissions
- `PartnerSelection`: Round 1 Task 2 submissions
- `CrisisWebSubmission`: Round 3 Task 1 submissions
- `ReactivationSequence`: Round 3 Task 2 submissions

### Group Collaboration
- `Group`: Group formation and management
- `GroupMember`: Group membership and roles
- `GroupMessage`: Chat and communication tracking
- `GroupDecision`: Shared decision tracking

## Scoring Algorithm

### Route Calculation (Round 1 Task 1)
- **Score**: Net profit (revenue - costs - penalties)
- **Factors**: Distance, cold chain breaches, regional modifiers
- **Formula**: `score = max(0, netProfit)`

### Partner Selection (Round 1 Task 2)
- **Score**: Weighted strategic alignment score
- **Factors**: Partner attributes vs. strategic priorities
- **Formula**: `score = weightedSum(partnerAttributes * strategicWeights)`

### Crisis Web (Round 3 Task 1)
- **Score**: Effectiveness percentage
- **Factors**: Action effectiveness, cost efficiency, risk management
- **Formula**: `score = effectiveness * 100`

### Reactivation Challenge (Round 3 Task 2)
- **Score**: Risk-adjusted completion score
- **Factors**: Duration, critical path, resource utilization
- **Formula**: `score = (1 - riskScore) * 100`

## Behavioral Indicators

### Participation Level
- **High**: > 0 messages in group activities
- **Low**: 0 messages in group activities

### Leadership Assessment
- **Yes**: Has been group leader in any task
- **No**: Never been group leader

### Collaboration Score
- **Formula**: `min(100, (totalMessages * 10) + (leadershipRoles * 20))`
- **Range**: 0-100

### Group Engagement
- **Metric**: Number of groups participated in
- **Range**: 0 to total available groups

### Communication Frequency
- **Metric**: Total messages sent across all groups
- **Range**: 0 to unlimited

## Security

### Authentication
- JWT-based authentication required for all admin endpoints
- Admin role verification on every request
- Session-based access control

### Authorization
- Only users with `ADMIN` role can access admin dashboard
- Role-based route protection
- Session-specific data access

## Real-time Features

### WebSocket Events
- `session-updated`: Session status changes
- `task-force-submitted`: Force submission notifications
- `timer-update`: Global timer synchronization
- `announcement`: Broadcast message delivery

### Live Updates
- Real-time completion rate updates
- Live participant status tracking
- Instant score calculations
- Immediate behavioral indicator updates

## Usage Instructions

### Accessing the Dashboard
1. Login with admin credentials
2. Navigate to `/admin` route
3. Dashboard automatically loads available sessions

### Managing Sessions
1. Select a session from the Sessions tab
2. Use Start/Pause/Complete buttons to control session flow
3. Monitor real-time status in the Monitoring tab

### Monitoring Progress
1. Select a session and go to Monitoring tab
2. View completion rates and participant status
3. Use timer controls to manage task timing
4. Send announcements as needed

### Analyzing Results
1. Go to Scoring tab for selected session
2. Click "Calculate Scores" to generate rankings
3. View overall rankings and task breakdowns
4. Export results using "Export CSV" button

### Behavioral Analysis
1. Select session and go to Behavioral tab
2. Click "Load Indicators" to analyze participant behavior
3. Review participation, leadership, and collaboration metrics

## Error Handling

### Common Issues
- **Session not found**: Verify session ID and permissions
- **Permission denied**: Ensure user has admin role
- **Timer sync issues**: Check WebSocket connection
- **Export failures**: Verify session has completed tasks

### Troubleshooting
1. Check browser console for JavaScript errors
2. Verify backend server is running
3. Confirm database connection
4. Check WebSocket connection status

## Performance Considerations

### Database Optimization
- Indexed queries for session lookups
- Efficient aggregation for scoring calculations
- Optimized joins for behavioral analysis

### Real-time Performance
- WebSocket connection pooling
- Efficient event broadcasting
- Minimal data transfer for live updates

### Scalability
- Session-based data partitioning
- Efficient caching strategies
- Optimized scoring algorithms

## Future Enhancements

### Planned Features
- Advanced analytics dashboard
- Custom scoring algorithms
- Enhanced behavioral tracking
- Integration with external LMS systems
- Advanced reporting capabilities

### Technical Improvements
- Real-time data visualization
- Advanced filtering and search
- Bulk operations for session management
- Enhanced export formats (PDF, Excel)
- Mobile-responsive design improvements 