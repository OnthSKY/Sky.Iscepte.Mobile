// Script to update API_DOCUMENTATION.md with new response formats
const fs = require('fs');

const filePath = './API_DOCUMENTATION.md';
let content = fs.readFileSync(filePath, 'utf8');

// Pattern 1: Update DELETE responses with success: true to 204 No Content
content = content.replace(
  /\*\*Response:\*\* `200 OK`\n```json\n\{\n  "success": true\n\}\n```/g,
  '**Response:** `204 No Content`\n```json\n{\n  "message": "OperationSuccessful"\n}\n```'
);

// Pattern 2: Update "Response: 200 OK (Single X object)" to full BaseControllerResponse format
// This will need manual updates for each type, but we can add a note

// Pattern 3: Update "Response: 200 OK (X object with generated id)" to 201 Created
content = content.replace(
  /\*\*Response:\*\* `200 OK` \(([^)]+) object with generated `id`\)/g,
  '**Response:** `201 Created`\n```json\n{\n  "message": "OperationSuccessful",\n  "data": {\n    // $1 object\n  }\n}\n```'
);

// Pattern 4: Update stats responses that don't have BaseControllerResponse wrapper
// This pattern is complex and may need manual review

// Write updated content
fs.writeFileSync(filePath, content, 'utf8');
console.log('API_DOCUMENTATION.md updated!');

