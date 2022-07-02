import { GameServer } from '../lib/Server';
import jsonData from './channeled_game/src/deck';
const cards = JSON.stringify(jsonData.cards)

enum GameState {
    bet,
    init,
    userTurn,
    dealerTurn
}

enum Deal {
    user,
    dealer,
    hidden
}

enum Message {
    bet = 'Place a Bet!',
    hitStand = 'Hit or Stand?',
    bust = 'Bust!',
    userWin = 'You Win!',
    dealerWin = 'Dealer Wins!',
    tie = 'Tie!'
}


const State = {
    deck: cards,
    // @ts-ignore
    userCards: [],
    userScore: 0,
    userCount: 0,
    userWalletAddress: "",
    userPublicKey: null,
    // @ts-ignore
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

const props = {
    port: 4040,
    initialState: State,
}
const server = new GameServer(props)

server.init()
