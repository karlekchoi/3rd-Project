/**
 * MCP를 사용한 손글씨 인식
 * 백엔드를 통해 MCP 서버에 접근합니다.
 */
export const recognizeHandwritingWithMCP = async (base64ImageData: string): Promise<string> => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
  
  try {
    const response = await fetch(`${BACKEND_URL}/recognize-mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        image: `data:image/png;base64,${base64ImageData}`,
        language: 'ko'
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || 'MCP 인식 실패');
    }

    const data = await response.json();
    return data.text || data.result || "";
  } catch (error: any) {
    console.error('MCP 손글씨 인식 오류:', error);
    throw new Error(`MCP 손글씨 인식 실패: ${error.message}`);
  }
};

