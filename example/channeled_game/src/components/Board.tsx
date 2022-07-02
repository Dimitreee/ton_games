import React, { useEffect } from 'react'
import { BlackJack } from './BlackJack'

interface IBoardProps {
    keyPair: any,
    walletAddress: any,
}

export const Board: React.FC<IBoardProps> = (props) => {
    const {
        keyPair,
        walletAddress,
    } = props;

    useEffect(() => {
        console.log(walletAddress)
        console.log(keyPair)
    })

    return (
        <div>
            <BlackJack />
        </div>
    )
}
