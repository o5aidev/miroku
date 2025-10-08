/**
 * Dashboard JavaScript
 * Loads KPI data and renders charts with real-time GitHub API integration
 */

let trendsChart = null;
let costChart = null;
let refreshInterval = null;

// Configuration
const CONFIG = {
  REFRESH_INTERVAL: 5 * 60 * 1000, // 5 minutes in milliseconds
  USE_LIVE_API: true, // Set to true to use GitHub API, false for static JSON
  GITHUB_TOKEN: '', // Optional: Add PAT for higher rate limits (not recommended for public pages)
  REPO_OWNER: 'ShunsukeHayashi',
  REPO_NAME: 'Miyabi',
};

async function loadDashboard() {
  try {
    let data;

    if (CONFIG.USE_LIVE_API) {
      // Try to fetch from GitHub API (fallback to static JSON if fails)
      try {
        data = await fetchFromGitHubAPI();
      } catch (apiError) {
        console.warn('GitHub API fetch failed, falling back to static data:', apiError);
        data = await fetchStaticData();
      }
    } else {
      data = await fetchStaticData();
    }

    // Hide loading, show dashboard
    document.getElementById('loading').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';

    // Render data
    renderSummary(data.summary);
    renderTrendsChart(data.trends);
    renderCostChart(data.agents);
    renderAgentTable(data.agents);
    renderTimestamp(data.generated);

  } catch (error) {
    console.error('Error loading dashboard:', error);
    document.getElementById('loading').style.display = 'none';
    const errorEl = document.getElementById('error');
    errorEl.textContent = `Error loading dashboard data: ${error.message}. Make sure dashboard-data.json exists.`;
    errorEl.style.display = 'block';
  }
}

async function fetchStaticData() {
  const response = await fetch('dashboard-data.json');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

async function fetchFromGitHubAPI() {
  const headers = {
    'Accept': 'application/vnd.github+json',
  };

  if (CONFIG.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${CONFIG.GITHUB_TOKEN}`;
  }

  // Fetch repository issues
  const issuesUrl = `https://api.github.com/repos/${CONFIG.REPO_OWNER}/${CONFIG.REPO_NAME}/issues?state=all&per_page=100`;
  const issuesResponse = await fetch(issuesUrl, { headers });

  if (!issuesResponse.ok) {
    throw new Error(`GitHub API error: ${issuesResponse.status}`);
  }

  const issues = await issuesResponse.json();

  // Calculate metrics from issues
  const totalIssues = issues.length;
  const completedIssues = issues.filter(i => i.state === 'closed').length;
  const completionRate = totalIssues > 0 ? (completedIssues / totalIssues) * 100 : 0;

  // Generate dashboard data from GitHub issues
  return {
    generated: new Date().toISOString(),
    summary: {
      totalIssues,
      completedIssues,
      completionRate: Math.round(completionRate * 10) / 10,
      avgDuration: 12.5, // Mock data - would need custom fields
      totalCost: 2.45, // Mock data - would need custom fields
      avgQualityScore: 94.3, // Mock data - would need custom fields
    },
    trends: generateMockTrends(),
    agents: generateMockAgentData(),
  };
}

function renderSummary(summary) {
  document.getElementById('total-issues').textContent = summary.totalIssues;
  document.getElementById('completion-rate').textContent = summary.completionRate + '%';
  document.getElementById('completed-issues').textContent = summary.completedIssues;
  document.getElementById('avg-duration').textContent = summary.avgDuration + ' min';
  document.getElementById('total-cost').textContent = '$' + summary.totalCost.toFixed(2);
  document.getElementById('avg-quality').textContent = summary.avgQualityScore + '/100';

  // Update progress bar
  document.getElementById('completion-progress').style.width = summary.completionRate + '%';
}

function renderTrendsChart(trends) {
  const ctx = document.getElementById('trends-chart').getContext('2d');

  if (trendsChart) {
    trendsChart.destroy();
  }

  trendsChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: trends.map(t => {
        const date = new Date(t.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }),
      datasets: [
        {
          label: 'Completed',
          data: trends.map(t => t.completed),
          borderColor: '#3fb950',
          backgroundColor: 'rgba(63, 185, 80, 0.1)',
          tension: 0.4,
          fill: true,
        },
        {
          label: 'In Progress',
          data: trends.map(t => t.inProgress),
          borderColor: '#58a6ff',
          backgroundColor: 'rgba(88, 166, 255, 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: '#c9d1d9',
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#8b949e',
            stepSize: 1,
          },
          grid: {
            color: '#30363d',
          },
        },
        x: {
          ticks: {
            color: '#8b949e',
          },
          grid: {
            color: '#30363d',
          },
        },
      },
    },
  });
}

function renderCostChart(agents) {
  const ctx = document.getElementById('cost-chart').getContext('2d');

  if (costChart) {
    costChart.destroy();
  }

  costChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: agents.map(a => a.name),
      datasets: [{
        data: agents.map(a => a.avgCost * a.tasksCompleted),
        backgroundColor: [
          '#58a6ff',
          '#3fb950',
          '#d29922',
          '#f85149',
        ],
        borderColor: '#161b22',
        borderWidth: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#c9d1d9',
            padding: 15,
          },
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed;
              return `${label}: $${value.toFixed(2)}`;
            },
          },
        },
      },
    },
  });
}

function renderAgentTable(agents) {
  const tbody = document.getElementById('agent-tbody');
  tbody.innerHTML = '';

  // Sort by tasks completed (descending)
  agents.sort((a, b) => b.tasksCompleted - a.tasksCompleted);

  for (const agent of agents) {
    const row = document.createElement('tr');

    row.innerHTML = `
      <td class="agent-name">${agent.name}</td>
      <td>${agent.tasksCompleted}</td>
      <td>${agent.avgDuration} min</td>
      <td>$${agent.avgCost.toFixed(2)}</td>
      <td>
        ${agent.avgQuality.toFixed(1)}/100
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${agent.avgQuality}%"></div>
        </div>
      </td>
    `;

    tbody.appendChild(row);
  }
}

function renderTimestamp(generated) {
  const date = new Date(generated);
  const formatted = date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  document.getElementById('timestamp').textContent = `Last updated: ${formatted}`;
}

// Theme toggle functionality
function initThemeToggle() {
  const toggleButton = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  const themeText = document.getElementById('theme-text');

  // Load saved theme
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeButton(savedTheme);

  toggleButton.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeButton(newTheme);
  });

  function updateThemeButton(theme) {
    if (theme === 'dark') {
      themeIcon.textContent = '🌙';
      themeText.textContent = 'Dark Mode';
    } else {
      themeIcon.textContent = '☀️';
      themeText.textContent = 'Light Mode';
    }
  }
}

// Auto-refresh functionality
function startAutoRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }

  refreshInterval = setInterval(() => {
    console.log('Auto-refreshing dashboard...');
    loadDashboard();
  }, CONFIG.REFRESH_INTERVAL);
}

// Mock data generators
function generateMockTrends() {
  const trends = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    trends.push({
      date: date.toISOString().split('T')[0],
      completed: Math.floor(Math.random() * 5) + 1,
      inProgress: Math.floor(Math.random() * 3) + 1,
      cost: Math.round((Math.random() * 0.5 + 0.1) * 100) / 100,
    });
  }

  return trends;
}

function generateMockAgentData() {
  return [
    {
      name: 'CodeGenAgent',
      tasksCompleted: 8,
      avgDuration: 7.2,
      avgCost: 0.12,
      avgQuality: 93.5,
    },
    {
      name: 'ReviewAgent',
      tasksCompleted: 5,
      avgDuration: 3.5,
      avgCost: 0.05,
      avgQuality: 96.2,
    },
    {
      name: 'DocsAgent',
      tasksCompleted: 3,
      avgDuration: 4.8,
      avgCost: 0.08,
      avgQuality: 91.7,
    },
    {
      name: 'DeploymentAgent',
      tasksCompleted: 2,
      avgDuration: 15.0,
      avgCost: 0.30,
      avgQuality: 98.5,
    },
  ];
}

// Load dashboard on page load
window.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  loadDashboard();
  startAutoRefresh();
});
