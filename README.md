# Hackathon Portal

The **Hackathon Portal** is a web-based platform developed for Niagara College - Toronto (NCT) to streamline and enhance the experience of students, mentors, judges, and program coordinators participating in hackathons. The portal centralizes various activities such as registration, team formation, mentor management, judging, and reporting, offering an efficient and user-friendly solution to managing hackathons.

## Key Features (Includes current development and future plans)

### 1. Registration Process
- **Student Registration**: Students from all GUS colleges can register by providing their basic details.
- **Profile Management**: Individual student profiles include basic information and email verification.
- **Team Formation**: Teams of up to five members can be formed, with a team profile that includes a team name, logo, and a description. Team leaders can manage their teams.
  
### 2. Mentor Management
- **Mentor Profiles**: Mentors have their own profiles and are assigned to teams manually by coordinators.
- **Interaction**: Mentors can communicate with teams through a chat or Q&A feature during the hackathon.

### 3. Judging and Grading
- **Live Grading System**: Judges can access a dedicated portal for grading teams based on predefined rubrics. The system auto-calculates rankings.
- **Customizable Rubrics**: Administrators can adjust rubrics based on different hackathon themes.
- **Project Submissions**: Teams can upload blueprints and final projects. These are visible to judges but not to other participants.

### 4. Team and Student Profiles
- **Individual Profiles**: Display achievements and participation history in past hackathons. Integration with social media for easy sharing.
- **Team Profiles**: Teams can update their progress and share files privately within their team.

### 5. Communication and Notifications
- **Automated Notifications**: The system sends notifications about deadlines, submission reminders, and schedules.
- **Configurable Notifications**: Coordinators can configure notifications for different roles (students, mentors, judges).

### 6. Reports and Analytics
- **Post-Hackathon Reports**: Automatic generation of team rankings, feedback summaries, and participation metrics.
- **Leaderboard**: Coordinators can access a live leaderboard.
  
### 7. Feedback Mechanism
- **Surveys**: Post-hackathon surveys for students, mentors, and judges to provide feedback.
- **Survey Data Reports**: Compiled into reports that identify areas for improvement.

### 8. Certificates
- **Participation Certificates**: Issued to all participants.
- **Appreciation Certificates**: Issued to mentors and judges for their contributions.

### 9. Scalability
- **Mobile and Web Platforms**: The portal will support both mobile and web platforms for broader accessibility.
- **Future Flexibility**: The system is designed to accommodate future features and user groups.

## Tech Stack

- **Frontend**: React.js
- **Backend**: Node.js / Express 
- **Database**: MongoDB
- **Version Control**: Git

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/biswashpoudel/group2-NCTHackathonPortal.git
   ```

2. Navigate into the project folder:

   ```bash
   cd group2-NCTHackathonPortal
   ```

3. Install dependencies for the frontend:

   ```bash
   npm install
   ```

4. If you are running a backend server, install the backend dependencies (if applicable):

   ```bash
   npm install
   ```

5. Start the frontend and backend servers:

   ```bash
   npm start
   ```

   The frontend should be accessible at `http://localhost:3000` (or another configured port).

## Contributing

We welcome contributions! To contribute, follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-name`).
3. Implement your changes.
4. Commit your changes (`git commit -am 'Add new feature'`).
5. Push your changes to your fork (`git push origin feature-name`).
6. Create a pull request.
