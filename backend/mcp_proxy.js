/**
 * MCP 프록시 서버 (Node.js)
 * Python 백엔드에서 MCP 서버와 통신하기 위한 프록시
 */

const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');

let mcpClient = null;

/**
 * MCP 클라이언트 초기화
 */
async function initializeMCP() {
  if (mcpClient) {
    return mcpClient;
  }

  try {
    const transport = new StdioClientTransport({
      command: 'npx',
      args: ['-y', '@smithery/cli', 'mcp'],
    });

    mcpClient = new Client({
      name: 'hangeul-garden-backend',
      version: '1.0.0',
    }, {
      capabilities: {
        tools: {},
      },
    });

    await mcpClient.connect(transport);
    console.error('✅ MCP 클라이언트 연결 성공');
    
    return mcpClient;
  } catch (error) {
    console.error('MCP 클라이언트 초기화 실패:', error);
    throw error;
  }
}

/**
 * 손글씨 인식
 */
async function recognizeHandwriting(imageBase64, language = 'ko') {
  try {
    const client = await initializeMCP();
    
    // MCP tools 목록 가져오기
    const tools = await client.listTools();
    
    // 손글씨 인식 도구 찾기
    const handwritingTool = tools.tools.find(
      (tool) => 
        tool.name.includes('handwriting') || 
        tool.name.includes('ocr') || 
        tool.name.includes('recognize') ||
        tool.name.includes('text') ||
        tool.name.includes('image')
    );

    if (!handwritingTool) {
      // 모든 도구 이름 출력
      console.error('사용 가능한 도구:', tools.tools.map(t => t.name));
      throw new Error('손글씨 인식 도구를 찾을 수 없습니다.');
    }

    // MCP 도구 호출
    const result = await client.callTool({
      name: handwritingTool.name,
      arguments: {
        image: `data:image/png;base64,${imageBase64}`,
        language: language,
      },
    });

    // 결과 파싱
    if (result.content && result.content.length > 0) {
      const content = result.content[0];
      if (typeof content === 'string') {
        return content;
      } else if (content.text) {
        return content.text;
      } else if (typeof content === 'object') {
        return JSON.stringify(content);
      }
    }

    throw new Error('MCP에서 결과를 받지 못했습니다.');
  } catch (error) {
    console.error('MCP 손글씨 인식 오류:', error);
    throw error;
  }
}

// 명령줄 인자에서 입력 받기
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error('Usage: node mcp_proxy.js <imageBase64> [language]');
    process.exit(1);
  }

  const imageBase64 = args[0];
  const language = args[1] || 'ko';

  recognizeHandwriting(imageBase64, language)
    .then(result => {
      console.log(JSON.stringify({ text: result, method: 'mcp' }));
      process.exit(0);
    })
    .catch(error => {
      console.error(JSON.stringify({ error: error.message }));
      process.exit(1);
    });
}

module.exports = { recognizeHandwriting, initializeMCP };








