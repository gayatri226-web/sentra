from fastapi import FastAPI

app = FastAPI(title="Sentra - Child Cyber-Safety Detection Engine")

@app.get("/")
def root():
    return {"status": "Sentra detection engine running"}

@app.get("/health")
def health():
    return {"monitoring": "active"}
