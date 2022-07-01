import React, { useRef } from 'react'
import './App.css';

function App() {
  const messageInput = useRef<HTMLInputElement | null>(null)

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    if (messageInput.current) {
      console.log(messageInput.current.value)
    }
  }

  return (
      <div className="App">
        <div className="App-header">
          <div className="Token-container">
            <form action="" onSubmit={handleSubmit}>
              <input type="text" ref={messageInput}/>
              <button>
                sendMessage
              </button>
            </form>
          </div>
        </div>
      </div>
  );
}

export default App;
