const API_BASE = 'http://localhost:5000/api';
let token = null;
let userId = null;
let taskId = null;

const testUser = {
  name: `AuditUser_${Date.now()}`,
  email: `audit_${Date.now()}@example.com`,
  password: 'Password123!',
};

async function runAudit() {
  console.log('--- STARTING NEX-TASK PRODUCTION AUDIT ---');

  // 1. REGISTER
  try {
    const regRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser),
    });
    const regData = await regRes.json();
    if (!regData.success) throw new Error(regData.message);
    token = regData.accessToken;
    userId = regData.user._id;
    console.log('✅ Registration: PASS');
  } catch (e) {
    console.error('❌ Registration: FAIL', e.message);
    return;
  }

  // 2. CREATE TASK
  try {
    const taskRes = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({
        title: 'Audit Test Task',
        description: 'Testing the creation of a task via API.',
        priority: 'high',
        dueDate: new Date().toISOString()
      }),
    });
    const taskData = await taskRes.json();
    if (!taskData.success) throw new Error(taskData.message);
    taskId = taskData.data._id;
    console.log('✅ Task Creation: PASS');
  } catch (e) {
    console.error('❌ Task Creation: FAIL', e.message);
  }

  // 3. AI ASSISTANT
  try {
    const aiRes = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({
        message: 'Hello AI'
      }),
    });
    if (!aiRes.ok) {
        const txt = await aiRes.text();
        throw new Error(txt);
    }
    console.log('✅ AI Assistant Stream: PASS');
  } catch (e) {
    console.error('❌ AI Assistant: FAIL', e.message);
  }

  console.log('--- AUDIT COMPLETE ---');
}

runAudit();
