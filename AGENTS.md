Project Overview
this project is a riddle game where users can submit riddles and get them verified using the Gemini API. The backend is built using Node.js and Express, with MongoDB as the database.
Existing Architecture
the backend consists of the following main components:
1. **Riddle Controller**: Handles incoming requests related to riddles, such as fetching a random riddle and submitting a riddle for verification.
2. **Riddle Submission Service**    : Interacts with the Gemini API to verify submitted riddles.
Existing Features
- Fetch a random riddle from the database.
- Submit a riddle for verification using the Gemini API.
Frontend Requirements
create a modern and user-friendly frontend interface for the riddle game. The frontend should allow users to:
- View a random riddle fetched from the backend.
- Submit a riddle for verification.
- During the submission process, the frontend should display a loading indicator while waiting for the response from the Gemini API. Once the verification is complete, display the result to the user.
- Use a responsive design to ensure the application works well on both desktop and mobile devices.
- Implement error handling to inform users of any issues during the submission or fetching process.
- Use a modern frontend framework  React to build the interface.
- Use ui libraries like Material-UI or Bootstrap to enhance the visual appeal and usability of the application.
Design System — visual direction, colors, typography, spacing, references.
- visual direction: clean, modern, and playful to match the theme of riddles and puzzles.
- colors: use a vibrant color palette with primary colors like #FF6F61 (coral), #6B5B95 (purple), and #88B04B (green)
- typography: use a sans-serif font like 'Roboto' or 'Open Sans' for readability    
- spacing: maintain consistent spacing and padding throughout the application to ensure a clean layout.
- references: take inspiration from popular puzzle and game websites for layout and interaction patterns, ensuring a fun and engaging user experience.
API Integration
- Use Axios to handle API requests to the backend for fetching riddles and submitting riddles for verification.
- Implement proper error handling for API requests to provide feedback to users in case of failures.
- Ensure that the frontend communicates effectively with the backend, handling loading states and displaying results or error messages appropriately.
Coding Conventions — component organization, naming, dependencies, security.
- component organization: organize components into folders based on their functionality (e.g., RiddleDisplay, RiddleSubmissionForm, LoadingIndicator).
- naming: use clear and descriptive names for components, functions, and variables to enhance code readability
- dependencies: manage dependencies using npm, and keep them up to date to ensure security
- security: implement best practices for security, such as input validation and sanitization, to prevent common vulnerabilities like XSS and SQL injection.
Implementation Workflow — inspect first, plan, implement incrementally, test, review.
- inspect first: thoroughly review the existing backend code and understand the API endpoints and data flow before starting frontend development.
- plan: create a detailed plan for the frontend implementation, including component structure, state management, and API integration.
