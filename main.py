from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import requests
from bs4 import BeautifulSoup

app = FastAPI()

# 定义请求格式
class ExtractRequest(BaseModel):
    url: str

# **1️⃣ 解析 TOS（HTML 转 Markdown）**
@app.post("/extract")
def extract_tos(request: ExtractRequest):
    """
    访问给定 URL 并提取 TOS 内容
    """
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36"
    }

    try:
        response = requests.get(request.url, headers=headers)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="无法访问该页面")

        soup = BeautifulSoup(response.text, "html.parser")

        # 提取文本
        paragraphs = soup.find_all("p")
        content = "\n\n".join([p.get_text() for p in paragraphs])

        # 如果 <p> 里内容太少，尝试提取 <div> / <article>
        if len(content.strip()) < 200:
            divs = soup.find_all(["div", "article"])
            content = "\n\n".join([div.get_text() for div in divs if len(div.get_text()) > 50])

        if not content:
            raise HTTPException(status_code=404, detail="未找到 TOS 内容")

        return {"url": request.url, "tos_text": content.strip()}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# **运行 FastAPI 服务器**
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
