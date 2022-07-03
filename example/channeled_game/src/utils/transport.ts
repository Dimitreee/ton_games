import { Manager, Socket } from 'socket.io-client'
import { GameState, Message } from '../constants'
import jsonData from '../deck';

const API_URL = "http://localhost:4040"

export class TransportManager {
    constructor() {
        this.manager =  new Manager(API_URL, {
            autoConnect: false,
            withCredentials: true,
        });
    }

    public init = <S>(state?: any) => {
        this.socket = this.manager?.socket("/");

        this.socket?.on("reconnect", (attempt) => {
            console.log("reconnected: ", attempt);
        });

        this.socket?.on("reconnect_attempt", (attempt) => {
            console.log("reconnect_attempt: ", attempt);
        });

        this.socket?.on("reconnect_failed", () => {
            console.log("reconnect_failed");
        });

        // @ts-ignore
        this.socket?.on("connect", () => {
            const engine = this.socket?.io.engine;
            if (!engine) {
                return;
            }

            this.isConnected = true;
            this.sendMessage("changeState", { ...INITIAL_STATE, ...state })

            engine.once("upgrade", () => {
                console.log(engine.transport.name);
            });

            engine.on("close", (reason) => {
                this.isConnected = false;
                console.log("connection closed: ", reason);
            });
        });

        this.socket?.on("ping", (e) => {
            console.log(e)
        })

        this.socket?.on("disconnect", () => {
            this.isConnected = false;
            this.socket?.connect();
        });

        this.socket?.on("stateChange", (state: S) => {
            if (this.stateChangeHandler) {
                this.stateChangeHandler(state)
            }
        })

        this.socket?.on("offChainInit", (payload: any) => {
            if (this.offChainHandler) {
                this.offChainHandler(state, payload)
            }
        })

        this.socket?.on("channelIsOpen", () => {
            if (this.openChannelHandler) {
                this.openChannelHandler()
            }
        })

        this.socket?.on("channelClosed", () => {
            window.location.reload()
        })

        this.socket?.connect()
    }

    public sendMessage = (message: string, payload?: any) => {
        this.socket?.emit(message, payload)
    }

    public onStateChange = (handler: any) => {
        this.stateChangeHandler = handler
    }

    public onOffChainInit = (handler: any) => {
        this.offChainHandler = handler
    }

    public onChanelOpen = (handler: any) => {
        this.openChannelHandler = handler
    }

    public isConnected: boolean = false;

    private stateChangeHandler?: (...args: any) => void;
    private offChainHandler?: (...args: any) => void;
    private openChannelHandler?: (...args: any) => void;
    private socket?: Socket;
    private manager?: Manager;
}

const manager = new TransportManager()

export const useTransport = <S>() => {
    const setUpdate = (payload: S) => {
        manager.sendMessage("changeState", payload)
    }

    const resetState = () => {
        manager.sendMessage("resetState", INITIAL_STATE)
    }

    const initOffchain = () => {
        manager.sendMessage("initOffchain", )
    }

    const initDapp = () => {
        manager.sendMessage("initDapp")
    }

    const closeDappChannel = (payload: any) => {
        manager.sendMessage("closeDappChannel", payload)
    }

    const emitChangeDealerBalance = (balance: number) => {
        manager.sendMessage("changeDealerBalance", balance)
    }

    const sign = (payload: any) => {
        manager.sendMessage("sign", payload)
    }

    return {
        sign,
        manager,
        initDapp,
        setUpdate,
        resetState,
        initOffchain,
        closeDappChannel,
        emitChangeDealerBalance,
    };
}

const cards = JSON.stringify(jsonData.cards)

export const INITIAL_STATE = {
    deck: cards,
    // @ts-ignore
    userCards: [],
    userScore: 0,
    userCount: 0,
    userWalletAddress: "",
    // @ts-ignore
    userPublicKey: null,
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
    channelAddress: null,
    channelId: null
}
