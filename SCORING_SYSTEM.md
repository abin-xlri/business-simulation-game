# Comprehensive Scoring System

## Overview

The Comprehensive Scoring System provides a sophisticated evaluation framework for the business simulation game, mapping participant performance to specific competencies and generating detailed behavioral indicators and final reports.

## Features

### 1. Behavioral Indicators Mapping
- **Competency Framework**: 10 core competencies mapped to specific tasks
- **Task-Competency Mapping**: Weighted relationships between tasks and competencies
- **Evidence Collection**: Automated evidence gathering from participant actions
- **Scoring Algorithms**: Task-specific scoring with competency weighting

### 2. Task-Specific Scoring
- **Round 1 Task 1 - Route Optimization**: Optimal route algorithm with profit-based scoring
- **Round 1 Task 2 - Partner Selection**: Multi-criteria decision scoring with strategic alignment
- **Round 2 - Group Collaboration**: Metrics based on participation, leadership, and communication
- **Round 3 - Crisis Management**: Effectiveness and risk management scoring

### 3. Final Report Generation
- **Individual Scores**: Per-competency scoring with detailed breakdowns
- **Ranking System**: Participant ranking across all competencies
- **Detailed Feedback**: Strengths and areas for improvement per competency
- **Export Capabilities**: CSV and JSON export formats

## Database Schema

### Core Models

#### Competency
```prisma
model Competency {
  id          String   @id @default(cuid())
  name        String   @unique
  description String
  category    CompetencyCategory
  weight      Float    @default(1.0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  taskCompetencies TaskCompetency[]
  behavioralIndicators BehavioralIndicator[]
}
```

#### TaskCompetency
```prisma
model TaskCompetency {
  id           String   @id @default(cuid())
  taskType     TaskType
  competencyId String
  weight       Float    @default(1.0)
  createdAt    DateTime @default(now())

  competency Competency @relation(fields: [competencyId], references: [id], onDelete: Cascade)

  @@unique([taskType, competencyId])
}
```

#### BehavioralIndicator
```prisma
model BehavioralIndicator {
  id           String   @id @default(cuid())
  userId       String
  sessionId    String
  competencyId String
  taskType     TaskType
  score        Float
  evidence     Json
  createdAt    DateTime @default(now())

  user       User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  session    Session    @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  competency Competency @relation(fields: [competencyId], references: [id], onDelete: Cascade)

  @@unique([userId, sessionId, competencyId, taskType])
}
```

#### FinalReport
```prisma
model FinalReport {
  id           String   @id @default(cuid())
  sessionId    String
  userId       String
  totalScore   Float
  rank         Int
  competencyScores Json
  feedback     Json
  generatedAt  DateTime @default(now())

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  session Session @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  @@unique([sessionId, userId])
}
```

### Enums

#### CompetencyCategory
```prisma
enum CompetencyCategory {
  ANALYTICAL_THINKING
  STRATEGIC_PLANNING
  COLLABORATION
  LEADERSHIP
  PROBLEM_SOLVING
  DECISION_MAKING
  COMMUNICATION
  ADAPTABILITY
  INNOVATION
  EXECUTION
}
```

#### TaskType
```prisma
enum TaskType {
  ROUND1_TASK1_ROUTE_OPTIMIZATION
  ROUND1_TASK2_PARTNER_SELECTION
  ROUND2_GROUP_MARKET_SELECTION
  ROUND2_GROUP_BUDGET_ALLOCATION
  ROUND3_TASK1_CRISIS_WEB
  ROUND3_TASK2_REACTIVATION_CHALLENGE
}
```

## Competency Framework

### Core Competencies

1. **Analytical Thinking** (35% weight in Route Optimization)
   - Data analysis performance
   - Pattern recognition
   - Logical reasoning

2. **Strategic Planning** (30% weight in Partner Selection)
   - Long-term thinking
   - Goal alignment
   - Strategic vision

3. **Collaboration** (30% weight in Group Tasks)
   - Team participation
   - Information sharing
   - Group contribution

4. **Leadership** (20% weight in Group Tasks)
   - Leadership roles
   - Team guidance
   - Decision responsibility

5. **Problem Solving** (30% weight in Crisis Management)
   - Problem identification
   - Solution generation
   - Implementation

6. **Decision Making** (25% weight in Partner Selection)
   - Decision quality
   - Factor consideration
   - Consequence evaluation

7. **Communication** (25% weight in Group Tasks)
   - Message clarity
   - Active listening
   - Dialogue engagement

8. **Adaptability** (25% weight in Crisis Management)
   - Change adaptation
   - Learning speed
   - Flexibility

9. **Innovation** (10% weight in Crisis Management)
   - Creative thinking
   - Novel solutions
   - Innovation implementation

10. **Execution** (25% weight in Reactivation Challenge)
    - Plan implementation
    - Resource management
    - Result achievement

## Task-Competency Mappings

### Round 1 Task 1: Route Optimization
- **Analytical Thinking**: 35% (Profit optimization analysis)
- **Problem Solving**: 25% (Route optimization challenges)
- **Decision Making**: 20% (Route selection decisions)
- **Execution**: 20% (Implementation effectiveness)

### Round 1 Task 2: Partner Selection
- **Strategic Planning**: 30% (Strategic alignment)
- **Decision Making**: 25% (Partner evaluation)
- **Analytical Thinking**: 25% (Criteria analysis)
- **Communication**: 20% (Decision rationale)

### Round 2: Group Market Selection
- **Collaboration**: 30% (Team participation)
- **Communication**: 25% (Group communication)
- **Leadership**: 20% (Leadership roles)
- **Strategic Planning**: 15% (Market strategy)
- **Decision Making**: 10% (Group decisions)

### Round 2: Group Budget Allocation
- **Collaboration**: 25% (Team coordination)
- **Strategic Planning**: 25% (Budget strategy)
- **Analytical Thinking**: 20% (Resource analysis)
- **Execution**: 15% (Implementation)
- **Communication**: 15% (Team communication)

### Round 3 Task 1: Crisis Web
- **Problem Solving**: 30% (Crisis resolution)
- **Adaptability**: 25% (Change management)
- **Decision Making**: 20% (Crisis decisions)
- **Analytical Thinking**: 15% (Risk analysis)
- **Innovation**: 10% (Creative solutions)

### Round 3 Task 2: Reactivation Challenge
- **Strategic Planning**: 30% (Restoration strategy)
- **Execution**: 25% (Implementation)
- **Problem Solving**: 20% (Challenge resolution)
- **Analytical Thinking**: 15% (Resource analysis)
- **Adaptability**: 10% (Flexibility)

## Scoring Algorithms

### Route Optimization Scoring
```typescript
score = Math.max(0, netProfit);
maxScore = 1000000; // Maximum possible profit
percentage = (score / maxScore) * 100;
```

### Partner Selection Scoring
```typescript
score = weightedSum(partnerAttributes * strategicWeights);
maxScore = 10;
percentage = (score / maxScore) * 100;
```

### Group Task Scoring
```typescript
participationScore = Math.min(100, (totalMessages * 10) + (leadershipRoles * 20));
collaborationScore = Math.min(100, (groupsParticipated * 25) + (totalMessages * 5));
score = (participationScore + collaborationScore) / 2;
```

### Crisis Management Scoring
```typescript
effectivenessScore = Math.round(effectiveness * 100);
riskScore = Math.round((1 - riskLevel) * 100);
score = (effectivenessScore + riskScore) / 2;
```

## API Endpoints

### Scoring Routes
```
POST   /api/scoring/initialize-competencies    # Initialize competencies
GET    /api/scoring/sessions/:id/calculate-scores    # Calculate comprehensive scores
GET    /api/scoring/sessions/:id/users/:userId/final-report    # Generate final report
GET    /api/scoring/sessions/:id/export    # Export results
```

### Request/Response Examples

#### Calculate Scores
```typescript
// Request
GET /api/scoring/sessions/session123/calculate-scores

// Response
{
  "success": true,
  "results": {
    "sessionId": "session123",
    "totalParticipants": 15,
    "userScores": [
      {
        "userId": "user123",
        "userName": "John Doe",
        "totalScore": 850000,
        "maxTotalScore": 1200000,
        "overallPercentage": 70.8,
        "rank": 1,
        "taskScores": [...],
        "competencyScores": [...]
      }
    ],
    "taskBreakdown": {...},
    "competencyBreakdown": {...}
  }
}
```

#### Generate Final Report
```typescript
// Request
GET /api/scoring/sessions/session123/users/user123/final-report?includeFeedback=true

// Response
{
  "success": true,
  "report": {
    "id": "report123",
    "sessionId": "session123",
    "userId": "user123",
    "totalScore": 850000,
    "rank": 1,
    "competencyScores": [...],
    "feedback": [
      {
        "competencyId": "analytical_thinking",
        "competencyName": "Analytical Thinking",
        "category": "ANALYTICAL_THINKING",
        "score": 85,
        "maxScore": 100,
        "percentage": 85,
        "strengths": ["Demonstrated strong ability to analyze complex data"],
        "areasForImprovement": ["Could benefit from more systematic data analysis"],
        "specificExamples": ["Data analysis performance", "Pattern recognition"]
      }
    ],
    "generatedAt": "2024-01-15T10:30:00Z"
  }
}
```

## Frontend Components

### ScoringDashboard
- **Overview Tab**: Summary cards, top performers table
- **Competencies Tab**: Competency breakdown with averages and top performers
- **Tasks Tab**: Task performance with completion rates
- **Reports Tab**: Detailed individual reports with feedback

### Features
- Real-time score calculation
- Interactive competency visualization
- Export functionality (CSV/JSON)
- Detailed feedback generation
- Performance ranking system

## Usage Instructions

### 1. Initialize Competencies
```bash
# Initialize competencies in database
curl -X POST http://localhost:3001/api/scoring/initialize-competencies \
  -H "Authorization: Bearer <admin_token>"
```

### 2. Calculate Scores
```bash
# Calculate comprehensive scores for a session
curl -X GET http://localhost:3001/api/scoring/sessions/session123/calculate-scores \
  -H "Authorization: Bearer <admin_token>"
```

### 3. Generate Reports
```bash
# Generate final report for a user
curl -X GET http://localhost:3001/api/scoring/sessions/session123/users/user123/final-report \
  -H "Authorization: Bearer <admin_token>"
```

### 4. Export Results
```bash
# Export results as CSV
curl -X GET "http://localhost:3001/api/scoring/sessions/session123/export?format=csv" \
  -H "Authorization: Bearer <admin_token>" \
  --output results.csv
```

## Scoring Thresholds

- **Excellent**: 90-100%
- **Good**: 75-89%
- **Satisfactory**: 60-74%
- **Needs Improvement**: 45-59%
- **Poor**: 0-44%

## Feedback Templates

Each competency has predefined feedback templates with:
- **Strengths**: Positive observations based on performance
- **Areas for Improvement**: Specific suggestions for development
- **Specific Examples**: Evidence-based examples from tasks

## Security

- **Authentication**: JWT-based authentication required
- **Authorization**: Admin role verification for all endpoints
- **Data Protection**: Secure storage of behavioral indicators
- **Access Control**: Session-specific data access

## Performance Considerations

- **Caching**: Score calculations cached to improve performance
- **Batch Processing**: Large datasets processed in batches
- **Database Optimization**: Indexed queries for fast retrieval
- **Memory Management**: Efficient data structures for large sessions

## Future Enhancements

1. **Machine Learning Integration**: Predictive scoring models
2. **Advanced Analytics**: Trend analysis and benchmarking
3. **Custom Competencies**: Configurable competency frameworks
4. **Real-time Scoring**: Live score updates during tasks
5. **Comparative Analysis**: Cross-session performance comparison
6. **Automated Insights**: AI-generated performance insights
7. **Mobile Optimization**: Responsive design for mobile devices
8. **API Rate Limiting**: Enhanced rate limiting for scoring endpoints 