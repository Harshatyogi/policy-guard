from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json
from pydantic import BaseModel
from typing import Dict, Any
from pathlib import Path

# 1️⃣ Create FastAPI app FIRST
app = FastAPI(title="JSON Rule Engine Validator")

# 2️⃣ Add CORS middleware AFTER app is created
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load rules.json
RULES_PATH = Path(__file__).parent / "rules.json"
if not RULES_PATH.exists():
    raise RuntimeError("rules.json not found")

with open(RULES_PATH, "r") as f:
    RULES_DOC = json.load(f)


# --- Utility functions ---
def exists(payload, field):
    return field in payload and payload[field] not in (None, "")


def equals(payload, field, value):
    return payload.get(field) == valuedef is_number(payload, field):
    try:
        float(payload.get(field))
        return True
    except:
        return False


def is_integer(payload, field):
    try:
        return float(payload.get(field)).is_integer()
    except:
        return False


def eval_condition(cond, payload):
    for key, val in cond.items():
        if key == "any":
            return any(eval_condition(c, payload) for c in val)
        if key == "all":
            return all(eval_condition(c, payload) for c in val)
        if key == "not":
            return not eval_condition(val, payload)
        if key == "exists":
            return exists(payload, val["field"])
        if key == "equals":
            return equals(payload, val["field"], val["value"])
        if key == "is_number":
            return is_number(payload, val["field"])
        if key == "is_integer":
            return is_integer(payload, val["field"])
    return False


def run_actions(actions, payload, ctx):
    for action in actions: act = action.get("action")

        if act == "append_message":
            ctx["messages"].append(action["message"])

        elif act == "set":
            if action["field"] == "valid":
                ctx["valid"] = action["value"]

        elif act == "validate_each":
            for field in action["fields"]:
                if exists(payload, field):
                    valid = (
                        is_integer(payload, field)
                        if action["validator"] == "is_integer"
                        else is_number(payload, field)
                    )
                    if not valid:
                        msg = action["on_failure_message"].replace("{field}", field)
                        ctx["messages"].append(msg)
                        ctx["valid"] = False

        elif act == "if":
            if eval_condition(action["predicate"], payload):
                run_actions(action.get("then", []), payload, ctx)
            else:
                run_actions(action.get("else", []), payload, ctx)


def evaluate_ruleset(ruleset, payload):
    ctx = {"valid": True, "messages": []}
    for rule in ruleset["rules"]:
        if eval_condition(rule["condition"], payload):
            run_actions(rule["then"], payload, ctx)

    return ctx
class ValidateRequest(BaseModel):
    data: Dict[str, Any]
    run_vehicle: bool = True
    run_policy: bool = True
    run_usage: bool = True


@app.post("/validate")
def validate(req: ValidateRequest):
    payload = req.data
    results = {}

    for rs in RULES_DOC["rulesets"]:
        name = rs["name"]

        if name == "vehicle_info" and not req.run_vehicle:
            continue
        if name == "policy_info" and not req.run_policy:
            continue
        if name == "usage_risk" and not req.run_usage:
            continue

        results[name] = evaluate_ruleset(rs, payload)

    return {"summary": results}


@app.get("/")
def root():
    return {
        "status": "running",
        "rulesets": [r["name"] for r in RULES_DOC["rulesets"]]
    }

