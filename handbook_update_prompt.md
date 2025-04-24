# Handbook Update Prompt

## Comprehensive Multi-Turn Update Process

```
Let's begin a multi-turn update process for this project handbook and related documentation. This will be a structured conversation to ensure comprehensive and precise updates.

TURN 1 - INITIAL ANALYSIS:
Analyze the code in the project and the current handbook.md file. Provide a high-level report identifying:
- New dependencies or technologies added to the project
- Changes in directory or file structure
- New npm scripts or modifications to existing commands
- Changes in configurations or environment variables
- New components, services, or APIs
- Database or migration changes
- Updates to the build or deployment process
- New code conventions or best practices adopted
- Missing information or outdated sections

TURN 2 - UPDATE PLANNING:
Based on the initial analysis, present a detailed update plan, indicating:
- Sections of the handbook to add
- Sections to update
- Sections to remove
- Proposed structural changes
- Technical accuracy issues to address
- Completeness gaps to fill
- Consistency improvements needed
- Usability enhancements to implement

TURN 3 - SECTION-BY-SECTION UPDATE:
Update the handbook section by section following these guidelines:

STYLE AND TONE:
- Technical but accessible style
- Active and direct voice
- Concise but comprehensive
- Expert perspective guiding a new developer
- Professional but not formal tone

STRUCTURE:
- Respect the existing hierarchical organization
- Group related information together
- Maintain consistency across similar sections

CONTENT:
- OBJECTIVE: Comprehensive and accurate guide for developers
- CONTEXT: For both onboarding new developers and as a reference
- KEY FOCUS: Architectural patterns, code conventions, and operational flows
- AVOID: Passwords/credentials, subjective commentary, non-technical jargon
- ENRICHMENT: Include practical examples wherever possible to illustrate concepts
  For example:
  - Code snippets showing how to use key components
  - Sample commands with expected outputs
  - Step-by-step examples for common workflows
  - Before/after examples for configurations

TURN 4 - UPDATE THE HANDBOOK UPDATE PROCESS:
Review this handbook_update_prompt.md file itself and suggest improvements:
- Are the prompt instructions still relevant and effective?
- Could the update process be more efficient?
- Does it reflect the latest project needs and AI capabilities?
- Provide updated content for the update_handbook.md file if needed

TURN 5 - FINAL REVIEW:
Conduct a final review to ensure:
- Overall consistency and readability
- Technical accuracy throughout
- Completeness of all sections
- Logical structure and organization
- No duplicate or contradictory information
- Sufficient practical examples in complex sections

TURN 6 - DELIVERY:
Produce the definitive versions of:
1. The updated handbook.md file in English
2. The updated handbook_update_prompt.md file in English

All content must be delivered in English, regardless of the original language of the documents.
```

## When to Use This Prompt

It is advisable to use this comprehensive update process:

1. **After Important Releases**: Every time a significant release is made, to ensure the handbook reflects all new features, APIs, and changes.

2. **Quarterly**: Even in the absence of major changes, a quarterly review helps keep documentation fresh and accurate, addressing any small changes that may have accumulated.

3. **After Architectural Changes**: Whenever significant changes are made to the project architecture (e.g., new dependencies, database schema changes, modified patterns), to ensure developers understand the new structure.

4. **Before Onboarding New Developers**: To ensure documentation is current and provides a reliable onboarding resource, reducing the learning curve for new team members.

5. **After Implementing New Components or Services**: When new major features are added, to document their purpose, implementation details, and integration points with the rest of the system.

## How to Use This Prompt

1. Ensure all recent changes have been committed to the repository before starting the update process.
2. Copy the prompt into a conversation with an AI assistant like Claude.
3. Share the codebase and relevant files with the AI (via file upload or repository access).
4. Engage in the multi-turn conversation, reviewing each step before proceeding to the next.
5. Implement the final updates to both the handbook.md and handbook_update_prompt.md files.

### Example Conversation Flow:

**User**: [Pastes the prompt]

**AI (Turn 1)**: "I've analyzed the codebase and handbook. Here are the key discrepancies I found:

- New authentication service added that's not documented
- Environment variable changes for the email service
- Updated build process using Webpack 5 instead of version 4
- Missing documentation for the new admin dashboard components"

**User**: "Looks good, what's your update plan?"

**AI (Turn 2)**: "Based on my analysis, here's my proposed update plan:

- Add new section: 'Authentication Service' with implementation details
- Update 'Environment Configuration' section with new email variables
- Update 'Build & Deployment' section to reflect Webpack 5 changes
- Add 'Admin Dashboard' section under the Components documentation
- Improve code examples throughout to match current implementation"

**User**: "Approved, please start updating section by section."

**AI (Turn 3)**: "I've updated the 'Authentication Service' section with implementation details:

````markdown
## Authentication Service

The application uses a JWT-based authentication service located in `src/services/auth/`.

### Usage Example

```javascript
import { authenticateUser } from '../services/auth'

// Authenticate a user
const authResult = await authenticateUser({
    username: 'user@example.com',
    password: 'password123',
})

// The result contains the JWT token and user info
const { token, user } = authResult
```
````

Would you like me to continue with the next section?"

... and so on through the turns.

## Benefits of This Approach

- **Comprehensive Updates**: Addresses both content and the update process itself, ensuring nothing is overlooked.

- **Structured Process**: Breaks down a complex documentation task into manageable steps, making it easier to handle large projects.

- **Quality Control**: Multiple review stages ensure accuracy and completeness before finalizing changes.

- **Self-Improving Process**: The update mechanism evolves with the project as the prompt itself is reviewed and enhanced.

- **Knowledge Preservation**: Maintains project knowledge even as team members change, creating a reliable source of truth.

- **Practical Learning**: Examples throughout the documentation facilitate faster learning and implementation by showing real usage patterns.

- **Consistent Documentation Style**: By following the same process each time, the documentation maintains a consistent voice and structure.
