import React from 'react'
import { BlackJack } from '../BlackJack/BlackJack'
import { useLiteNodeContext } from '../LiteNodeProvider/LiteNodeProvider'
import { WindMillLoading } from "react-loadingg";

export const Game: React.FC = () => {
    const { isChannelOpen } = useLiteNodeContext();

    // @ts-ignore
    return isChannelOpen ? <BlackJack /> : <WindMillLoading />
};
