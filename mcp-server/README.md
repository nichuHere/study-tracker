# StudyTracker MCP Server

An MCP (Model Context Protocol) server that lets AI assistants manage your StudyTracker app — add tasks, check progress, manage reminders, and more — all through natural language.

## Setup

### 1. Install dependencies

```bash
cd mcp-server
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Add to Claude Desktop

Edit your Claude Desktop config file:
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

Add this server config:

```json
{
  "mcpServers": {
    "studytracker": {
      "command": "node",
      "args": ["C:/OneDrive - H&R BLOCK LTD/Documents/HRB/Experiments/StudyTrackerApp/mcp-server/index.js"]
    }
  }
}
```

### 4. Restart Claude Desktop

The StudyTracker tools will appear in Claude's tool menu (hammer icon).

## Available Tools

| Tool | Description | Example prompt |
|------|-------------|----------------|
| `list_profiles` | List all student profiles | "Show me all profiles" |
| `add_task` | Add a study task | "Add a task for Malayalam for 20 mins" |
| `get_tasks` | Get tasks for a day | "Show today's tasks for Adhi" |
| `complete_task` | Mark task as done | "Mark task 42 as completed" |
| `delete_task` | Delete a task | "Delete task 42" |
| `list_subjects` | List subjects & chapters | "What subjects does Adhi have?" |
| `add_subject` | Add a new subject | "Add Science with chapters Force, Energy, Light" |
| `add_reminder` | Add a one-time reminder | "Remind about project submission on March 10" |
| `get_reminders` | Get reminders for a day | "What reminders are there today?" |
| `add_recurring_reminder` | Add a repeating reminder | "Add tuition every Mon/Wed at 7:15 PM" |
| `get_exams` | View exams & progress | "Show exam preparation status" |
| `get_study_summary` | Full study overview | "Give me a study summary" |

## Testing

Run the server directly to verify it starts:

```bash
node index.js
```

It should print `StudyTracker MCP Server running on stdio` to stderr and wait for input.
