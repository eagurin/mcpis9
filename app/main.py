from fastapi import FastAPI

app = FastAPI(title="MCPIS9 API", description="A modern FastAPI application", version="1.0.0")


@app.get("/")
def read_root():
    return {"message": "Hello World", "status": "running"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
