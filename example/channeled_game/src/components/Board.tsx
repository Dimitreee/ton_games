import React from 'react'


interface IBoardProps {
    keyPair: any,
    walletAddress: any
}

export const Board: React.FC<IBoardProps> = ({keyPair, walletAddress, ...rest}) => {
    const handleStartGame = async (e: any) => {
        console.log(walletAddress)
        console.log(keyPair)
    };

    return (
        <div>
            <button onClick={handleStartGame}>
                Start game
            </button>
        </div>
    )
}
