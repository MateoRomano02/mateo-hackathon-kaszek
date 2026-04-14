"""Pre-built tool schemas for common patterns."""

SEARCH_TOOL = {
    "name": "search",
    "description": "Search for information",
    "input_schema": {
        "type": "object",
        "properties": {
            "query": {"type": "string"},
            "category": {"type": "string"}
        },
        "required": ["query"]
    }
}

CLASSIFY_TOOL = {
    "name": "classify",
    "description": "Classify input into categories",
    "input_schema": {
        "type": "object",
        "properties": {
            "category": {"type": "string", "enum": ["positive", "negative", "neutral", "urgent", "other"]},
            "confidence": {"type": "number"},
            "reasoning": {"type": "string"}
        },
        "required": ["category", "confidence"]
    }
}

ENTITY_SCHEMA = {
    "type": "object",
    "properties": {
        "entities": {
            "type": "array",
            "items": {"type": "object", "properties": {
                "name": {"type": "string"}, "type": {"type": "string"}, "value": {"type": "string"}
            }, "required": ["name", "type", "value"]}
        },
        "summary": {"type": "string"}
    },
    "required": ["entities", "summary"]
}
