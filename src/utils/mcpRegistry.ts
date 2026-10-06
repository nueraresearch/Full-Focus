export interface MCPServerDefinition {
  id: string;
  name: string;
  platform: 'github' | 'wordpress' | 'm365' | 'google' | 'browser' | 'claude';
  status: 'official' | 'verified_community' | 'native_host';
  packageName: string;
  command: string;
  transport: 'stdio' | 'sse';
  description: string;
  toolsProvided: { name: string; description: string }[];
  envVarsRequired: string[];
  sampleConfig: Record<string, any>;
}

export const mcpServersRegistry: MCPServerDefinition[] = [
  {
    id: 'mcp-github',
    name: 'GitHub MCP Server',
    platform: 'github',
    status: 'official',
    packageName: '@modelcontextprotocol/server-github',
    command: 'npx -y @modelcontextprotocol/server-github',
    transport: 'stdio',
    description: 'Official Anthropic/ModelContextProtocol server for GitHub repository, issue, and pull request automation.',
    envVarsRequired: ['GITHUB_PERSONAL_ACCESS_TOKEN'],
    toolsProvided: [
      { name: 'create_issue', description: 'Create an issue in a GitHub repository' },
      { name: 'create_pull_request', description: 'Open a PR across branches with diff review' },
      { name: 'get_file_contents', description: 'Read files and directories in any repo' },
      { name: 'search_repositories', description: 'Search across code and pull requests' },
      { name: 'push_files', description: 'Commit and push changes directly' }
    ],
    sampleConfig: {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-github'],
      env: {
        GITHUB_PERSONAL_ACCESS_TOKEN: 'ghp_YOUR_TOKEN_HERE'
      }
    }
  },
  {
    id: 'mcp-wordpress',
    name: 'WordPress (nueraresearch.com) MCP Server',
    platform: 'wordpress',
    status: 'verified_community',
    packageName: 'wordpress-mcp-server',
    command: 'npx -y wordpress-mcp-server',
    transport: 'stdio',
    description: 'REST API v2 bridge for nueraresearch.com to read drafts, create articles, schedule publications, and update SEO metadata.',
    envVarsRequired: ['WP_URL', 'WP_USERNAME', 'WP_APP_PASSWORD'],
    toolsProvided: [
      { name: 'get_posts', description: 'Fetch recent posts, drafts, and revisions from nueraresearch.com' },
      { name: 'create_post', description: 'Publish or schedule research whitepapers and editorial articles' },
      { name: 'update_post_meta', description: 'Update SEO focus keywords and metadata' },
      { name: 'upload_media', description: 'Upload benchmark charts and diagrams to WP Media Library' }
    ],
    sampleConfig: {
      command: 'npx',
      args: ['-y', 'wordpress-mcp-server'],
      env: {
        WP_URL: 'https://nueraresearch.com',
        WP_USERNAME: 'admin',
        WP_APP_PASSWORD: 'xxxx-xxxx-xxxx-xxxx'
      }
    }
  },
  {
    id: 'mcp-m365',
    name: 'Microsoft 365 / Graph MCP Server',
    platform: 'm365',
    status: 'verified_community',
    packageName: 'microsoft-graph-mcp',
    command: 'npx -y microsoft-graph-mcp',
    transport: 'stdio',
    description: 'Microsoft Graph API bridge for Outlook email, Outlook Calendar, Microsoft Teams chat, and Microsoft To Do.',
    envVarsRequired: ['AZURE_CLIENT_ID', 'AZURE_CLIENT_SECRET', 'AZURE_TENANT_ID'],
    toolsProvided: [
      { name: 'list_calendar_events', description: 'Fetch Outlook schedule and Teams meeting slots' },
      { name: 'create_calendar_event', description: 'Schedule deep work blocks in Outlook 365' },
      { name: 'get_todo_tasks', description: 'Sync Microsoft To Do items into prioritized tasks' },
      { name: 'send_teams_message', description: 'Broadcast delivery updates to Teams channels' }
    ],
    sampleConfig: {
      command: 'npx',
      args: ['-y', 'microsoft-graph-mcp'],
      env: {
        AZURE_CLIENT_ID: 'YOUR_AZURE_CLIENT_ID',
        AZURE_TENANT_ID: 'common'
      }
    }
  },
  {
    id: 'mcp-google',
    name: 'Google Workspace MCP Server',
    platform: 'google',
    status: 'official',
    packageName: '@modelcontextprotocol/server-google-drive',
    command: 'npx -y @modelcontextprotocol/server-google-drive',
    transport: 'stdio',
    description: 'Google Workspace bridge connecting Google Calendar, Google Docs roadmaps, Google Tasks, and Google Drive.',
    envVarsRequired: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
    toolsProvided: [
      { name: 'list_calendar_events', description: 'Fetch Google Calendar events and Google Meet links' },
      { name: 'create_calendar_event', description: 'Create time-block event in Google Calendar' },
      { name: 'read_document', description: 'Ingest research notes and sprint roadmaps from Google Docs' },
      { name: 'search_files', description: 'Search Google Drive for shared assets and spreadsheets' }
    ],
    sampleConfig: {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-google-drive'],
      env: {
        GOOGLE_APPLICATION_CREDENTIALS: '/path/to/credentials.json'
      }
    }
  },
  {
    id: 'mcp-browser',
    name: 'Chrome / Edge (Puppeteer & DevTools) MCP Server',
    platform: 'browser',
    status: 'official',
    packageName: '@modelcontextprotocol/server-puppeteer',
    command: 'npx -y @modelcontextprotocol/server-puppeteer',
    transport: 'stdio',
    description: 'Direct browser automation for Chrome & Edge to capture active tabs, take screenshots, extract arXiv papers, and scrape content.',
    envVarsRequired: [],
    toolsProvided: [
      { name: 'navigate', description: 'Navigate to any webpage or research URL in Chrome/Edge' },
      { name: 'screenshot', description: 'Capture screenshot of research page or web app' },
      { name: 'click', description: 'Click interactive DOM elements' },
      { name: 'evaluate', description: 'Execute JavaScript to extract table or benchmark data' }
    ],
    sampleConfig: {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-puppeteer'],
      env: {}
    }
  },
  {
    id: 'mcp-claude',
    name: 'Claude Desktop / Claude Code (MCP Native Host)',
    platform: 'claude',
    status: 'native_host',
    packageName: '@modelcontextprotocol/server-memory',
    command: 'npx -y @modelcontextprotocol/server-memory',
    transport: 'stdio',
    description: 'Claude acts as the central MCP Host/Client that orchestrates all 5 other MCP servers. It also supports persistent Graph Memory.',
    envVarsRequired: [],
    toolsProvided: [
      { name: 'create_entities', description: 'Save long-term strategic context and Nuera research entities' },
      { name: 'read_graph', description: 'Recall relationships between objectives, papers, and repos' },
      { name: 'search_nodes', description: 'Search semantic memory for past decisions' }
    ],
    sampleConfig: {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-memory'],
      env: {}
    }
  }
];

/**
 * Generates the complete claude_desktop_config.json
 */
export function generateClaudeDesktopConfig(): string {
  const mcpServers: Record<string, any> = {};

  mcpServersRegistry.forEach((srv) => {
    const key = srv.platform === 'wordpress' ? 'wordpress-nuera' : srv.platform;
    mcpServers[key] = srv.sampleConfig;
  });

  return JSON.stringify({ mcpServers }, null, 2);
}
