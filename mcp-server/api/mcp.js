/**
 * Vercel API route — serves the StudyTracker MCP server over Streamable HTTP.
 *
 * POST /api/mcp   → JSON-RPC messages
 * GET  /api/mcp   → SSE stream (not used in stateless mode)
 * DELETE /api/mcp  → session termination (not used in stateless mode)
 */
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createMcpServer } from '../lib/server.js';

export default async function handler(req, res) {
  // Only POST is supported for stateless JSON-RPC
  if (req.method === 'POST') {
    try {
      const server = createMcpServer();

      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined, // stateless — no session tracking
      });

      // Clean up when the connection closes
      res.on('close', () => {
        transport.close();
        server.close();
      });

      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (err) {
      console.error('MCP handler error:', err);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: '2.0',
          error: { code: -32603, message: 'Internal server error' },
          id: null,
        });
      }
    }
    return;
  }

  if (req.method === 'GET') {
    // SSE not supported in stateless mode
    res.status(405).json({
      jsonrpc: '2.0',
      error: { code: -32000, message: 'SSE not supported in stateless mode. Use POST for JSON-RPC.' },
      id: null,
    });
    return;
  }

  if (req.method === 'DELETE') {
    // Session termination not applicable in stateless mode
    res.status(405).json({
      jsonrpc: '2.0',
      error: { code: -32000, message: 'Session termination not applicable in stateless mode.' },
      id: null,
    });
    return;
  }

  res.status(405).json({
    jsonrpc: '2.0',
    error: { code: -32000, message: 'Method not allowed. Use POST.' },
    id: null,
  });
}
