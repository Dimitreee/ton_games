import { Manager, Socket } from 'socket.io-client'

const API_URL = "w:4040"

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
            this.socket?.emit("changeState", state);

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

        this.socket?.connect()
    }

    public sendMessage = (message: string, payload?: any) => {
        this.socket?.emit(message, payload)
    }

    public onStateChange = (handler: any) => {
        this.stateChangeHandler = handler
    }

    public isConnected: boolean = false;

    private stateChangeHandler?: (...args: any) => void;
    private socket?: Socket;
    private manager?: Manager;
}

const manager = new TransportManager()

export const useTransport = <S>() => {

    const setUpdate = (payload: S) => {
        manager.sendMessage("changeState", payload)
    }

    const resetState = () => {
        manager.sendMessage("resetState")
    }

    return { manager, setUpdate, resetState };
}
