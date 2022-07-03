import React  from 'react'
import './App.css';
import { useLiteNodeContext } from './components/LiteNodeProvider/LiteNodeProvider'
import { Login } from "./components/Login/Login";
import { Game } from "./components/Game/Game";

function App() {
    const { keyPair } = useLiteNodeContext();

    return (
        <div className="App">
            { keyPair ? <Game /> : <Login/> }
        </div>
    );
}

export default App;
