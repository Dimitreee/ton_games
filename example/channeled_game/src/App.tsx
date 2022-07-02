import React, { useState } from 'react'
import './App.css';
import { Login } from "./components/Login/Login";
import { Game } from "./components/Game/Game";

function App() {
    const [isLoginHidden, setLoginHidden] = useState(false);
    const [keyPair, setKeyPair] = useState({
        publicKey: null,
        secretKey: null
    });

    return (
        <div className="App">
            {
                isLoginHidden
                    ? <Game keyPair={keyPair}/>
                    : <Login
                        setLoginHidden={(isLoginHidden) => setLoginHidden(isLoginHidden)}
                        setKeyPair={(keyPair => setKeyPair(keyPair))}
                    />
            }
        </div>
    );
}

export default App;
