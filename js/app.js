async function fetchData(url) {
  try {
    const response = await fetch(url + '?t=' + Date.now());
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (e) {
    console.error(`Could not fetch data from ${url}:`, e);
    return null;
  }
}

function updateStatus(data) {
  if (!data) return;
  const container = document.getElementById('org-status');
  container.innerHTML = `
    <div class="list-item">最終更新: ${data.last_updated}</div>
    <div class="list-item">未処理下書き: <strong>${data.pending_drafts}</strong></div>
    <div class="list-item">未処理法案: <strong>${data.pending_proposals}</strong></div>
    <div style="margin-top:10px">
      ${data.loops.map(loop => `
        <div class="list-item">
          <span class="status-badge status-${loop.status}">${loop.status}</span>
          <strong>${loop.name}</strong> (${loop.interval})
          <div class="ts">Last: ${loop.last_run}</div>
        </div>
      `).join('')}
    </div>
  `;
}

function updateLogs(data) {
  if (!data) return;
  const container = document.getElementById('recent-logs');
  container.innerHTML = data.entries.map(entry => `
    <div class="list-item">
      <span class="ts">${entry.ts}</span>
      <span class="tag tag-${entry.tag}">${entry.tag}</span>
      <span>${entry.message}</span>
    </div>
  `).join('');
}

function updateTasks(data) {
  if (!data) return;
  const container = document.getElementById('pending-tasks');
  let html = '<h3>メール下書き</h3>';
  html += data.email_drafts.map(d => `
    <div class="list-item">
      <span class="tag tag-${d.priority}">${d.priority}</span>
      <strong>${d.subject}</strong>
      <div class="ts">${d.created} | ${d.file}</div>
    </div>
  `).join('');
  
  html += '<h3 style="margin-top:16px">法案</h3>';
  html += data.proposals.map(p => `
    <div class="list-item">
      <strong>${p.title}</strong>
      <div class="ts">${p.created} | ${p.file}</div>
    </div>
  `).join('');
  container.innerHTML = html;
}

function updateSchedule(data) {
  if (!data) return;
  const container = document.getElementById('schedule');
  container.innerHTML = data.jobs.map(job => `
    <div class="list-item">
      <div style="font-weight:600">${job.description}</div>
      <div class="ts">${job.label}</div>
      <div style="color: var(--accent-color)">次回: ${job.next}</div>
    </div>
  `).join('');
}

function updateCommits(data) {
  if (!data) return;
  const container = document.getElementById('git-activity');
  container.innerHTML = data.commits.map(c => `
    <div class="list-item">
      <code style="color:var(--accent-color)">${c.hash}</code>
      <strong>${c.message}</strong>
      <div class="ts">${c.date}</div>
    </div>
  `).join('');
}

async function refreshAll() {
  const [status, logs, tasks, schedule, commits] = await Promise.all([
    fetchData('data/status.json'),
    fetchData('data/log.json'),
    fetchData('data/tasks.json'),
    fetchData('data/schedule.json'),
    fetchData('data/commits.json')
  ]);

  updateStatus(status);
  updateLogs(logs);
  updateTasks(tasks);
  updateSchedule(schedule);
  updateCommits(commits);
}

// Initial load
refreshAll();

// Auto refresh every 30 seconds
setInterval(refreshAll, 30000);
