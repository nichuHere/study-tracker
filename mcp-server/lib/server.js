/**
 * Shared MCP Server factory — used by both local stdio and Vercel HTTP entry points.
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// ─── Supabase Setup ─────────────────────────────────────────────────────────

function getSupabaseClient() {
  // Accept both naming conventions (local .env  vs  Vercel env vars)
  const url = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
  // Prefer service role key (bypasses RLS — needed for server-side access)
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    || process.env.SUPABASE_ANON_KEY
    || process.env.REACT_APP_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY environment variables');
  }

  return createClient(url, key);
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function todayIST() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

async function resolveProfileId(supabase, profileName) {
  if (!profileName) {
    const { data } = await supabase.from('profiles').select('id, name').limit(1).single();
    return data;
  }
  const { data } = await supabase
    .from('profiles')
    .select('id, name')
    .ilike('name', `%${profileName}%`)
    .limit(1)
    .single();
  return data;
}

// ─── Server Factory ─────────────────────────────────────────────────────────

export function createMcpServer() {
  const supabase = getSupabaseClient();

  const server = new McpServer({
    name: 'studytracker',
    version: '1.0.0',
    description: 'Manage tasks, subjects, exams, and reminders in the StudyTracker app',
  });

  // ─── list_profiles ──────────────────────────────────────────────────────
  server.tool(
    'list_profiles',
    'List all student profiles in the app',
    {},
    async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, class')
        .order('name');
      if (error) return { content: [{ type: 'text', text: `Error: ${error.message}` }] };
      const text = data.length === 0
        ? 'No profiles found.'
        : data.map(p => `• ${p.name} (class: ${p.class || 'N/A'}, id: ${p.id})`).join('\n');
      return { content: [{ type: 'text', text }] };
    }
  );

  // ─── add_task ───────────────────────────────────────────────────────────
  server.tool(
    'add_task',
    'Add a study task for a student. Example: "add a task for malayalam for 20 mins"',
    {
      subject: z.string().describe('Subject name, e.g. "Malayalam", "Maths", "Science"'),
      duration: z.number().optional().default(30).describe('Duration in minutes (default: 30)'),
      date: z.string().optional().describe('Date in YYYY-MM-DD format (default: today)'),
      chapter: z.string().optional().describe('Chapter name (optional)'),
      activity: z.string().optional().describe('Activity like "Read", "Practice", "Revise" (optional)'),
      instructions: z.string().optional().describe('Additional instructions (optional)'),
      profile_name: z.string().optional().describe('Student name (optional, uses first profile if omitted)'),
    },
    async ({ subject, duration, date, chapter, activity, instructions, profile_name }) => {
      const profile = await resolveProfileId(supabase, profile_name);
      if (!profile) return { content: [{ type: 'text', text: 'Profile not found.' }] };
      const taskDate = date || todayIST();
      const { data, error } = await supabase
        .from('tasks')
        .insert([{ profile_id: profile.id, subject, chapter: chapter || null, activity: activity || null, duration: duration || 30, date: taskDate, completed: false, instructions: instructions || null }])
        .select()
        .single();
      if (error) return { content: [{ type: 'text', text: `Error: ${error.message}` }] };
      return {
        content: [{
          type: 'text',
          text: `✅ Task added for ${profile.name}:\n• Subject: ${subject}\n• Duration: ${duration || 30} mins\n• Date: ${taskDate}${chapter ? `\n• Chapter: ${chapter}` : ''}${activity ? `\n• Activity: ${activity}` : ''}\n• Task ID: ${data.id}`,
        }],
      };
    }
  );

  // ─── get_tasks ──────────────────────────────────────────────────────────
  server.tool(
    'get_tasks',
    "Get tasks for a student. Defaults to today's tasks.",
    {
      date: z.string().optional().describe('Date in YYYY-MM-DD format (default: today)'),
      profile_name: z.string().optional().describe('Student name (optional)'),
      include_completed: z.boolean().optional().default(false).describe('Include completed tasks'),
    },
    async ({ date, profile_name, include_completed }) => {
      const profile = await resolveProfileId(supabase, profile_name);
      if (!profile) return { content: [{ type: 'text', text: 'Profile not found.' }] };
      const taskDate = date || todayIST();
      let query = supabase.from('tasks').select('*').eq('profile_id', profile.id).eq('date', taskDate).order('created_at');
      if (!include_completed) query = query.eq('completed', false);
      const { data, error } = await query;
      if (error) return { content: [{ type: 'text', text: `Error: ${error.message}` }] };
      if (data.length === 0) return { content: [{ type: 'text', text: `No ${include_completed ? '' : 'pending '}tasks for ${profile.name} on ${taskDate}.` }] };
      const lines = data.map(t => {
        const status = t.completed ? '✅' : '⬜';
        return `${status} ${t.subject}${t.chapter ? ` — ${t.chapter}` : ''} (${t.duration} min)${t.activity ? ` [${t.activity}]` : ''}`;
      });
      return { content: [{ type: 'text', text: `Tasks for ${profile.name} on ${taskDate}:\n${lines.join('\n')}` }] };
    }
  );

  // ─── complete_task ──────────────────────────────────────────────────────
  server.tool(
    'complete_task',
    'Mark a task as completed',
    { task_id: z.number().describe('The task ID to mark as complete') },
    async ({ task_id }) => {
      const { data, error } = await supabase.from('tasks').update({ completed: true }).eq('id', task_id).select().single();
      if (error) return { content: [{ type: 'text', text: `Error: ${error.message}` }] };
      return { content: [{ type: 'text', text: `✅ Marked task "${data.subject}${data.chapter ? ` — ${data.chapter}` : ''}" as completed.` }] };
    }
  );

  // ─── delete_task ────────────────────────────────────────────────────────
  server.tool(
    'delete_task',
    'Delete a task by ID',
    { task_id: z.number().describe('The task ID to delete') },
    async ({ task_id }) => {
      const { error } = await supabase.from('tasks').delete().eq('id', task_id);
      if (error) return { content: [{ type: 'text', text: `Error: ${error.message}` }] };
      return { content: [{ type: 'text', text: `🗑️ Task ${task_id} deleted.` }] };
    }
  );

  // ─── list_subjects ─────────────────────────────────────────────────────
  server.tool(
    'list_subjects',
    'List all subjects and their chapters for a student',
    { profile_name: z.string().optional().describe('Student name (optional)') },
    async ({ profile_name }) => {
      const profile = await resolveProfileId(supabase, profile_name);
      if (!profile) return { content: [{ type: 'text', text: 'Profile not found.' }] };
      const { data, error } = await supabase.from('subjects').select('*').eq('profile_id', profile.id).order('name');
      if (error) return { content: [{ type: 'text', text: `Error: ${error.message}` }] };
      if (data.length === 0) return { content: [{ type: 'text', text: `No subjects found for ${profile.name}.` }] };
      const lines = data.map(s => {
        const chapterCount = s.chapters?.length || 0;
        const chapterNames = s.chapters?.map(c => c.name || c).join(', ') || 'none';
        return `📚 ${s.name} (${chapterCount} chapters): ${chapterNames}`;
      });
      return { content: [{ type: 'text', text: `Subjects for ${profile.name}:\n${lines.join('\n')}` }] };
    }
  );

  // ─── add_subject ────────────────────────────────────────────────────────
  server.tool(
    'add_subject',
    'Add a new subject for a student',
    {
      name: z.string().describe('Subject name'),
      chapters: z.array(z.string()).optional().default([]).describe('List of chapter names (optional)'),
      profile_name: z.string().optional().describe('Student name (optional)'),
    },
    async ({ name, chapters, profile_name }) => {
      const profile = await resolveProfileId(supabase, profile_name);
      if (!profile) return { content: [{ type: 'text', text: 'Profile not found.' }] };
      const chapterObjs = (chapters || []).map(ch => ({ name: ch, status: 'pending' }));
      const { data, error } = await supabase.from('subjects').insert([{ profile_id: profile.id, name, chapters: chapterObjs }]).select().single();
      if (error) return { content: [{ type: 'text', text: `Error: ${error.message}` }] };
      return { content: [{ type: 'text', text: `📚 Subject "${name}" added for ${profile.name} with ${chapterObjs.length} chapters. (ID: ${data.id})` }] };
    }
  );

  // ─── add_reminder ──────────────────────────────────────────────────────
  server.tool(
    'add_reminder',
    'Add a one-time reminder for a student',
    {
      title: z.string().describe('Reminder title'),
      date: z.string().describe('Date in YYYY-MM-DD format'),
      description: z.string().optional().describe('Additional details (optional)'),
      profile_name: z.string().optional().describe('Student name (optional)'),
    },
    async ({ title, date, description, profile_name }) => {
      const profile = await resolveProfileId(supabase, profile_name);
      if (!profile) return { content: [{ type: 'text', text: 'Profile not found.' }] };
      const { data, error } = await supabase.from('reminders').insert([{ profile_id: profile.id, title, date, description: description || null }]).select().single();
      if (error) return { content: [{ type: 'text', text: `Error: ${error.message}` }] };
      return { content: [{ type: 'text', text: `🔔 Reminder added for ${profile.name}:\n• ${title}\n• Date: ${date}${description ? `\n• Details: ${description}` : ''}\n• ID: ${data.id}` }] };
    }
  );

  // ─── get_reminders ─────────────────────────────────────────────────────
  server.tool(
    'get_reminders',
    'Get reminders for a student, optionally filtered by date',
    {
      date: z.string().optional().describe('Date in YYYY-MM-DD (default: today)'),
      profile_name: z.string().optional().describe('Student name (optional)'),
    },
    async ({ date, profile_name }) => {
      const profile = await resolveProfileId(supabase, profile_name);
      if (!profile) return { content: [{ type: 'text', text: 'Profile not found.' }] };
      const targetDate = date || todayIST();
      const { data: oneTime, error: e1 } = await supabase.from('reminders').select('*').eq('profile_id', profile.id).eq('date', targetDate);
      const dayOfWeek = new Date(targetDate).getDay();
      const { data: recurring, error: e2 } = await supabase.from('recurring_reminders').select('*').eq('profile_id', profile.id);
      if (e1 || e2) return { content: [{ type: 'text', text: `Error: ${(e1 || e2).message}` }] };
      const matchingRecurring = (recurring || []).filter(r => r.days?.includes(dayOfWeek));
      const lines = [];
      (oneTime || []).forEach(r => lines.push(`🔔 ${r.title}${r.description ? ` — ${r.description}` : ''}`));
      matchingRecurring.forEach(r => lines.push(`🔁 ${r.title} (${r.time}–${r.end_time})${r.description ? ` — ${r.description}` : ''}`));
      if (lines.length === 0) return { content: [{ type: 'text', text: `No reminders for ${profile.name} on ${targetDate}.` }] };
      return { content: [{ type: 'text', text: `Reminders for ${profile.name} on ${targetDate}:\n${lines.join('\n')}` }] };
    }
  );

  // ─── add_recurring_reminder ─────────────────────────────────────────────
  server.tool(
    'add_recurring_reminder',
    'Add a recurring reminder (e.g. tuition every Mon/Wed at 7pm)',
    {
      title: z.string().describe('Reminder title'),
      time: z.string().describe('Start time in HH:MM (24h) format, e.g. "19:15"'),
      end_time: z.string().optional().default('20:00').describe('End time in HH:MM format'),
      days: z.array(z.number().min(0).max(6)).describe('Days of week: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat'),
      description: z.string().optional().describe('Additional details (optional)'),
      profile_name: z.string().optional().describe('Student name (optional)'),
    },
    async ({ title, time, end_time, days, description, profile_name }) => {
      const profile = await resolveProfileId(supabase, profile_name);
      if (!profile) return { content: [{ type: 'text', text: 'Profile not found.' }] };
      const { data, error } = await supabase.from('recurring_reminders').insert([{ profile_id: profile.id, title, time, end_time: end_time || '20:00', days, description: description || null }]).select().single();
      if (error) return { content: [{ type: 'text', text: `Error: ${error.message}` }] };
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayStr = days.map(d => dayNames[d]).join(', ');
      return { content: [{ type: 'text', text: `🔁 Recurring reminder added for ${profile.name}:\n• ${title}\n• ${time}–${end_time || '20:00'} on ${dayStr}\n• ID: ${data.id}` }] };
    }
  );

  // ─── get_exams ──────────────────────────────────────────────────────────
  server.tool(
    'get_exams',
    'Get all exams for a student with subjects, dates, and chapter progress',
    { profile_name: z.string().optional().describe('Student name (optional)') },
    async ({ profile_name }) => {
      const profile = await resolveProfileId(supabase, profile_name);
      if (!profile) return { content: [{ type: 'text', text: 'Profile not found.' }] };
      const { data, error } = await supabase.from('exams').select('*').eq('profile_id', profile.id).order('date');
      if (error) return { content: [{ type: 'text', text: `Error: ${error.message}` }] };
      if (data.length === 0) return { content: [{ type: 'text', text: `No exams found for ${profile.name}.` }] };
      const lines = data.map(exam => {
        const subjects = exam.subjects || [];
        const subjectInfo = subjects.map(s => {
          const total = s.chapters?.length || 0;
          const done = s.chapters?.filter(c => c.status === 'completed' || c.status === 'reviewed').length || 0;
          return `  📖 ${s.subject} (${s.date}) — ${done}/${total} chapters done`;
        }).join('\n');
        return `📝 ${exam.name}\n${subjectInfo}`;
      });
      return { content: [{ type: 'text', text: `Exams for ${profile.name}:\n${lines.join('\n\n')}` }] };
    }
  );

  // ─── get_study_summary ──────────────────────────────────────────────────
  server.tool(
    'get_study_summary',
    "Get a summary of a student's study progress — tasks, subjects, upcoming exams",
    { profile_name: z.string().optional().describe('Student name (optional)') },
    async ({ profile_name }) => {
      const profile = await resolveProfileId(supabase, profile_name);
      if (!profile) return { content: [{ type: 'text', text: 'Profile not found.' }] };
      const today = todayIST();
      const [tasksRes, subjectsRes, examsRes, remindersRes] = await Promise.all([
        supabase.from('tasks').select('*').eq('profile_id', profile.id).eq('date', today),
        supabase.from('subjects').select('*').eq('profile_id', profile.id),
        supabase.from('exams').select('*').eq('profile_id', profile.id).gte('date', today).order('date').limit(5),
        supabase.from('reminders').select('*').eq('profile_id', profile.id).eq('date', today),
      ]);
      const tasks = tasksRes.data || [];
      const subjects = subjectsRes.data || [];
      const exams = examsRes.data || [];
      const reminders = remindersRes.data || [];
      const completedTasks = tasks.filter(t => t.completed).length;
      const totalMins = tasks.reduce((sum, t) => sum + (t.duration || 0), 0);
      const lines = [
        `📊 Study Summary for ${profile.name} (${today})`, '',
        `📋 Today's Tasks: ${completedTasks}/${tasks.length} completed (${totalMins} min total)`,
        tasks.map(t => `  ${t.completed ? '✅' : '⬜'} ${t.subject} (${t.duration} min)`).join('\n'), '',
        `📚 Subjects: ${subjects.length}`,
        subjects.map(s => `  • ${s.name} (${s.chapters?.length || 0} chapters)`).join('\n'), '',
        `📝 Upcoming Exams: ${exams.length}`,
        exams.map(e => `  • ${e.name} (${e.date})`).join('\n'), '',
        `🔔 Today's Reminders: ${reminders.length}`,
        reminders.map(r => `  • ${r.title}`).join('\n'),
      ];
      return { content: [{ type: 'text', text: lines.filter(l => l !== undefined).join('\n') }] };
    }
  );

  return server;
}
