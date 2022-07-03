import jsonData from './deck';

const cards = JSON.stringify(jsonData.cards)

export enum GameState {
    bet,
    init,
    userTurn,
    dealerTurn
}

export enum Deal {
    user,
    dealer,
    hidden
}

export enum Message {
    bet = 'Place a Bet!',
    hitStand = 'Hit or Stand?',
    bust = 'Bust!',
    userWin = 'You Win!',
    dealerWin = 'Dealer Wins!',
    tie = 'Tie!'
}

export interface State {
    deck?: any,
    userCards?: any,
    userScore?: any,
    userCount?: any,
    userWalletAddress?: string,
    userPublicKey?: any,
    dealerCards?: any,
    dealerScore?: any,
    dealerCount?: any,
    balance?: any,
    bet?: any,
    gameState?: any,
    message?: any,
    buttonState?: any,
}

export const initialState: State = {
    deck: [],
    // @ts-ignore
    userCards: [],
    userScore: 0,
    userCount: 0,
    userWalletAddress: "",
    userPublicKey: null,
    // @ts-ignore
    dealerPublicKey: null,
    dealerWalletAddress: "",
    dealerCards: [],
    dealerScore: 0,
    dealerCount: 0,
    balance: 100,
    bet: 0,
    gameState: GameState.bet,
    message: Message.bet,
    buttonState: {
        hitDisabled: false,
        standDisabled: false,
        resetDisabled: true
    },
}
