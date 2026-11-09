from fastapi import FastAPI

app = FastAPI(title="TaskFlow")

@app.get("/health")
def health():
    return {"status": "ok"}