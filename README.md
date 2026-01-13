# 🎓 MoodleMate (UIR Connect Edition)

> **An AI-Powered Study Companion for University Students**

MoodleMate is a local RAG (Retrieval-Augmented Generation) chatbot designed to help students navigate complex course materials. By simulating the **UIR Connect** interface, it provides a familiar, professional environment where students can ask questions and get instant, cited answers from their course PDFs.



---

## ✨ Key Features

-   **🔍 Intelligent RAG Q&A**: Powered by **Llama 3** (via Groq), it answers questions based *strictly* on your uploaded PDFs.
-   **📑 Deep Source Linking**: Every answer includes citation chips. Click a source to open the PDF at the **exact page**.
-   **🎨 UIR Connect Theme**: A professional, responsive UI mimicking the official university portal (Navy Blue & Gold).
-   **🛡️ Privacy-First**:
    -   **Local Data**: All PDFs and Vector Embeddings (`ChromaDB`) stay on your machine.
    -   **History Control**: "Clear History" button to wipe chat logs instantly.
    -   **Prompt Guard**: Resistant to prompt injection attacks.
-   **💾 Persistent Sessions**: Chat history is saved locally using SQLite, so you can pick up where you left off.

---

## 🛠️ Technical Stack

-   **Backend**: Python 3.11+, **FastAPI** (Async Web Server)
-   **Frontend**: Vanilla HTML5, CSS3, JavaScript (No complex build steps)
-   **Database**:
    -   **SQLite**: Relational storage for Chat History & Sessions.
    -   **ChromaDB**: Vector storage for PDF Embeddings.
-   **AI Engines**:
    -   **LLM**: Llama 3.1 8B (Groq API)
    -   **Embeddings**: `all-MiniLM-L6-v2` (HuggingFace)
    -   **Orchestration**: LangChain

---

## 🚀 Installation & Setup

### Prerequisites
-   Python 3.10 or higher
-   A [Groq API Key](https://console.groq.com/) (Free)

### 1. Clone & Install
```bash
# Clone the repository (if applicable)
# git clone https://github.com/yourusername/moodlemate.git
cd "AI Project"

# Create a virtual environment
python -m venv .venv

# Activate it
# Windows:
.\.venv\Scripts\activate
# Mac/Linux:
# source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment
Create a `.env` file in the root directory:
```ini
GROQ_API_KEY=gsk_your_actual_key_here
```

### 3. Add Course Materials
Place your PDF files into the **`AI Module/`** directory.
*Example: `AI Module/Lecture1_Intro.pdf`*

### 4. Ingest Data (Teach the AI)
Run the ingestion script to read the PDFs and create the vector database:
```bash
python ingest.py
```
*You typically run this once, or whenever you add new PDFs.*

---

## 🏃‍♂️ Usage

### Start the Server
```bash
python app.py
```
The server will start at `http://127.0.0.1:8000`.

### Interaction
1.  **Ask Questions**: Type queries like *"Explain the concept of Neural Networks from the slides"*.
2.  **Check Sources**: Click the citations (e.g., `Lecture1.pdf (Page 12)`) to verify the answer.
3.  **Manage History**: Use the sidebar to switch between sessions or clear your history.

---

## 📂 Project Structure

```
c:\AI Project\
├── AI Module/              # 📂 Place PDF course files here
├── chroma_db/              # 🧠 Vector Database (Generated)
├── static/                 # 🎨 Frontend Assets
│   ├── index.html          # Main Interface
│   ├── style.css           # UIR Theme Styles
│   ├── script.js           # Frontend Logic
│   └── logo.png            # Assets
├── app.py                  # 🚀 Main FastAPI Server
├── ingest.py               # 📚 Data Ingestion Script
├── chat.db                 # 💾 SQLite Database (History)
├── requirements.txt        # 📦 Dependencies
└── .env                    # 🔑 API Keys (Not shared)
```

---

## 🔒 Security

-   **Prompt Leak Protection**: The system prompt is hardened to refuse revealing internal instructions.
-   **Input Validation**: Filenames are sanitized to prevent directory traversal attacks.

---

## 📝 License
This project is an **MVP** created for educational purposes.
*University International of Rabat branding is used for simulation purposes only.*

