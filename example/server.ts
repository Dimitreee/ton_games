import { Socket } from 'socket.io'
import { Controller, GameServer } from '../lib/Server'
import { StateManager } from '../lib/StateManager'
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
    // @ts-ignore
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

class GameController implements Controller {
    constructor() {
    }

    public onEvent (event: string, data: any) {
        switch (event) {
            case "" :
                break;
            default:
                break;
        }
    }

    private handleBetPlace () {

    }

    public setSocket (socket: Socket) {
        this.socket = socket;
    }

    public setState (state: StateManager) {
        this.state = state;
    }

    private socket?: Socket;
    private state?: StateManager;
}

const props = {
    port: 4040,
    initialState: State,
    controller: new GameController()
}

const server = new GameServer(props)

server.init()
