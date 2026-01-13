const chatContainer = document.getElementById('chat-messages');
const welcomeMessage = document.getElementById('welcome-screen');
const userInput = document.getElementById('user-input');
let currentSessionId = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadSessions();

    // Enter key handler
    const inputField = document.getElementById('user-input');
    if (inputField) {
        inputField.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault(); // Prevent default behavior (like form submit or newline)
                sendMessage();
            }
        });
    }
});

// Close menus when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.options-btn') && !e.target.closest('.options-menu')) {
        document.querySelectorAll('.options-menu').forEach(el => el.remove());
        document.querySelectorAll('.history-item').forEach(el => el.classList.remove('active-menu'));
    }
});

// ... existing toggleSidebar ...

// ... existing handleKeyPress ...

// ... existing setInput ...

// ... existing clearChat ...

async function loadSessions() {
    try {
        const response = await fetch('/sessions');
        const data = await response.json();
        const historyGroup = document.getElementById('history-list');

        // Clear existing (remove spinner if present)
        historyGroup.innerHTML = '';

        data.sessions.forEach(session => {
            const item = document.createElement('div');
            item.className = 'history-item';
            if (session.id === currentSessionId) item.classList.add('active');

            item.onclick = () => loadChat(session.id);
            item.innerHTML = `
                <span class="material-symbols-outlined">chat_bubble_outline</span>
                <span class="text">${session.title}</span>
            `;

            historyGroup.appendChild(item);
        });
    } catch (error) {
        console.error("Error loading sessions:", error);
    }
}

async function clearHistory() {
    if (!confirm("Are you sure you want to delete all chat history? This cannot be undone.")) return;

    try {
        const response = await fetch('/history', { method: 'DELETE' });
        if (response.ok) {
            loadSessions();
            // Optional: reset current view if needed, or just reload page
            if (currentSessionId) {
                window.location.reload();
            }
        } else {
            alert("Failed to clear history.");
        }
    } catch (error) {
        console.error("Error clearing history:", error);
    }
}

async function loadChat(sessionId) {
    console.log("Loading chat:", sessionId);
    currentSessionId = sessionId;

    try {
        // Hide Welcome
        if (welcomeMessage) welcomeMessage.style.display = 'none';

        // Clear current View
        const messages = chatContainer.querySelectorAll('.message');
        messages.forEach(msg => msg.remove());

        // Add Loading
        const loadingId = addLoadingIndicator();

        // Update Sidebar Active State
        document.querySelectorAll('.history-item').forEach(el => el.classList.remove('active'));

        // We do NOT reload sessions here to avoid race conditions causing UI flicker
        // loadSessions();

        const response = await fetch(`/history/${sessionId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Chat history loaded, messages:", data.messages.length);

        document.getElementById(loadingId).remove();

        data.messages.forEach(msg => {
            // Note: sources are not yet persisted in DB, passing empty array for now
            addMessage(msg.content, msg.role);
        });

    } catch (error) {
        console.error("Error loading chat:", error);
        alert(`Error loading chat: ${error.message}`);
        // Remove loading if it stuck
        const loading = document.querySelector('[id^="loading-"]');
        if (loading) loading.remove();
    }
}

async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    if (welcomeMessage) welcomeMessage.style.display = 'none';

    addMessage(text, 'user');
    userInput.value = '';

    const loadingId = addLoadingIndicator();

    try {
        const payload = { message: text };
        if (currentSessionId) {
            payload.session_id = currentSessionId;
        }

        const response = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const data = await response.json();
        document.getElementById(loadingId).remove();

        if (response.ok) {
            addMessage(data.response, 'assistant', data.sources); // Pass sources to addMessage

            // If it was a new session, update ID and reload sidebar
            if (data.new_session) {
                currentSessionId = data.session_id;
                loadSessions();
            }
        } else {
            addMessage("Error: Could not get response.", 'assistant');
        }
    } catch (error) {
        if (document.getElementById(loadingId)) document.getElementById(loadingId).remove();
        console.error('Error:', error);
        addMessage("Sorry, something went wrong.", 'assistant');
    }
}

// ...
function addMessage(text, sender, sources = []) {
    const div = document.createElement('div');
    // Align with CSS: user -> 'user', assistant -> 'assistant'
    const styleClass = sender === 'user' ? 'user' : 'assistant';
    div.className = `message ${styleClass}`;
    // ...
    let iconHtml = '';
    // User requested to remove the RKLE/Sparkle icon
    // if (styleClass === 'assistant') { ... }

    let sourcesHtml = '';
    if (sources && sources.length > 0) {
        sourcesHtml = `
            <div class="sources-container">
                <div class="sources-label">Sources:</div>
                <div class="sources-list">
                    ${sources.map(src => {
            // Parse "Filename.pdf (Page X)"
            const match = src.match(/(.*?) \(Page (\d+)\)/);
            if (match) {
                const filename = match[1];
                const page = match[2];
                return `<a href="/pdfs/${filename}#page=${page}" target="_blank" class="source-chip">${src} <span class="material-symbols-outlined" style="font-size: 14px; margin-left: 4px;">open_in_new</span></a>`;
            }
            return `<span class="source-chip">${src}</span>`;
        }).join('')}
                </div>
            </div>
        `;
    }

    div.innerHTML = `
        <div class="message-inner">
            ${styleClass === 'assistant' ? iconHtml : ''}
            <div class="bubble">
                <div class="text">${formatText(text)}</div>
                ${sourcesHtml}
            </div>
        </div>
    `;

    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function addLoadingIndicator() {
    const id = 'loading-' + Date.now();
    const div = document.createElement('div');
    div.className = 'message assistant'; // Match CSS class
    div.id = id;

    div.innerHTML = `
        <div class="message-inner">
             <!-- Icon removed per request -->
            <div class="bubble">
                <div class="text">Thinking...</div>
            </div>
        </div>
    `;
    // ...

    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    return id;
}

function formatText(text) {
    if (!text) return "";
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');
}
