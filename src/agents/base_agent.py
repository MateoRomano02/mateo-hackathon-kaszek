"""Simple agentic loop with tool use."""
from src.api.claude_client import client, MODEL

class Agent:
    def __init__(self, system_prompt: str, tools: list, tool_handlers: dict, max_iterations: int = 5, verbose: bool = True):
        self.system_prompt = system_prompt
        self.tools = tools
        self.tool_handlers = tool_handlers
        self.max_iterations = max_iterations
        self.verbose = verbose
        self.messages = []

    def run(self, user_input: str) -> str:
        self.messages.append({"role": "user", "content": user_input})
        for _ in range(self.max_iterations):
            response = client.messages.create(
                model=MODEL, max_tokens=2048, system=self.system_prompt,
                tools=self.tools, messages=self.messages
            )
            if response.stop_reason == "end_turn":
                text = next((b.text for b in response.content if hasattr(b, "text")), "")
                self.messages.append({"role": "assistant", "content": response.content})
                return text
            if response.stop_reason == "tool_use":
                self.messages.append({"role": "assistant", "content": response.content})
                tool_results = []
                for block in response.content:
                    if block.type == "tool_use":
                        if self.verbose: print(f"  [Agent] {block.name}({block.input})")
                        result = self.tool_handlers.get(block.name, lambda x: "Not implemented")(block.input)
                        tool_results.append({"type": "tool_result", "tool_use_id": block.id, "content": str(result)})
                self.messages.append({"role": "user", "content": tool_results})
        return "Max iterations reached"

    def reset(self): self.messages = []
