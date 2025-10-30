# Unit_Test_Setup_Log.md

## Tool Choice
**Tool:** pytest  
**Rationale:**  
We selected **pytest** because our project backend is built with **FastAPI (Python)**.  
Pytest allows **fast, isolated unit and integration testing** for Python functions, supports **fixtures and mocking**, and integrates easily with CI/CD pipelines.  
It complements E2E tests (Playwright) by testing **backend logic, authentication, validation, and session handling** without running a browser.

## Installation Commands
```bash
# Install pytest and HTTP testing tools
pip install pytest
pip install httpx
pip install pytest-asyncio
