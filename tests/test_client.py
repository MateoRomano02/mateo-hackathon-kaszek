def test_import():
    from src.api.claude_client import client, MODEL
    assert MODEL == "claude-sonnet-4-6"

def test_chat():
    from src.api.claude_client import chat
    r = chat("Say 'OK' only.")
    assert len(r) > 0
