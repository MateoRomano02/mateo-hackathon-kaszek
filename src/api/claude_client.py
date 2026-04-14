"""Claude API client — hackathon-optimized wrapper."""
import os
import anthropic
from dotenv import load_dotenv

load_dotenv()

client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))
MODEL = "claude-sonnet-4-6"

def chat(user_message: str, system_prompt: str = "You are a helpful assistant.", max_tokens: int = 1024) -> str:
    """Simple single-turn chat."""
    response = client.messages.create(
        model=MODEL, max_tokens=max_tokens, system=system_prompt,
        messages=[{"role": "user", "content": user_message}]
    )
    return response.content[0].text

def chat_with_history(messages: list, system_prompt: str = "", max_tokens: int = 1024) -> tuple:
    """Multi-turn. Returns (response_text, updated_messages)."""
    response = client.messages.create(
        model=MODEL, max_tokens=max_tokens, system=system_prompt, messages=messages
    )
    text = response.content[0].text
    return text, messages + [{"role": "assistant", "content": text}]

def chat_with_tools(user_message: str, tools: list, system_prompt: str = "", max_tokens: int = 2048) -> dict:
    """Tool use. Returns {text, tool_calls, stop_reason}."""
    response = client.messages.create(
        model=MODEL, max_tokens=max_tokens, system=system_prompt,
        tools=tools, messages=[{"role": "user", "content": user_message}]
    )
    result = {"stop_reason": response.stop_reason, "tool_calls": [], "text": ""}
    for block in response.content:
        if block.type == "tool_use":
            result["tool_calls"].append({"id": block.id, "name": block.name, "input": block.input})
        elif block.type == "text":
            result["text"] = block.text
    return result

def structured_output(user_message: str, schema: dict, system_prompt: str = "") -> dict:
    """Force JSON via tool use trick."""
    tool = [{"name": "extract", "description": "Extract structured data", "input_schema": schema}]
    result = chat_with_tools(user_message, tool, system_prompt or "Extract accurately.", 2048)
    return result["tool_calls"][0]["input"] if result["tool_calls"] else {}

if __name__ == "__main__":
    r = chat("Say 'Claude ready!' and nothing else.")
    print(f"Test: {r}")
