"""
Streamlit UI — hackathon demo interface.
Run: streamlit run ui.py
"""
import streamlit as st
from src.api.claude_client import chat, chat_with_history
from prompts.system_prompts import BASE_ASSISTANT

st.set_page_config(
    page_title="[YOUR APP NAME]",
    page_icon="🚀",
    layout="centered"
)

st.title("🚀 [Your App Name]")
st.caption("Built at Kaszek x Anthropic Hackathon 2026")

# Initialize session state
if "messages" not in st.session_state:
    st.session_state.messages = []
if "history" not in st.session_state:
    st.session_state.history = []

# Sidebar
with st.sidebar:
    st.header("Settings")
    system_prompt = st.text_area(
        "System prompt",
        value=BASE_ASSISTANT,
        height=150
    )
    if st.button("Clear conversation"):
        st.session_state.messages = []
        st.session_state.history = []
        st.rerun()
    
    st.divider()
    st.markdown("**How it works:**")
    st.markdown("1. [Step 1]")
    st.markdown("2. [Step 2]")
    st.markdown("3. [Step 3]")

# Chat interface
for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.write(msg["content"])

if prompt := st.chat_input("Type your message..."):
    # Add user message
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.write(prompt)
    
    # Get response
    with st.chat_message("assistant"):
        with st.spinner("Thinking..."):
            # Build history format for API
            history = [
                {"role": m["role"], "content": m["content"]}
                for m in st.session_state.messages[:-1]
            ]
            history.append({"role": "user", "content": prompt})
            
            response, updated_history = chat_with_history(
                messages=history,
                system_prompt=system_prompt
            )
        st.write(response)
    
    st.session_state.messages.append({"role": "assistant", "content": response})
    st.session_state.history = updated_history
