import React, { useState } from 'react'
import './App.css';
import {Login} from "./components/Login";
import {Game} from "./components/Game";


function App() {
  const [isLoginHidden, setLoginHidden] = useState(false);
  const [keyPair, setKeyPair] = useState({publicKey: null, secretKey: null});
  return (
      <div className="App">
        <div className="App-header">
          {
            isLoginHidden ? <Game keyPair={keyPair}/>
                : <Login
                    setLoginHidden={(isLoginHidden) => setLoginHidden(isLoginHidden)}
                    setKeyPair={(keyPair => setKeyPair(keyPair))}
                />
          }
        </div>
      </div>
  );
}

export default App;
