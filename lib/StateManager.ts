export class StateManager {
    constructor() {
        this.storage = new Map<string, Record<string, any>>();
    }

    public setSocket(socketId: string, update: Record<string, any>) {
        this.storage.set(socketId, update)
    }

    public get = (socketId: string) => {
        return this.storage.get(socketId)
    }

    public set = (socketId: string, update: Record<string, any>) => {
        const { state: prevState, socket } = this.get(socketId)
        const { state } = update

        const nextState = {...prevState, ...state}

        if (JSON.stringify(prevState) === JSON.stringify(nextState)) {
            return;
        }

        this.storage.set(socketId, { socket: socket, state: nextState })

        const stateFromStorage = this.get(socketId);

        socket.emit("stateChange", { ...stateFromStorage.state })
    }

    storage?: Map<string, Record<string, any>>;
}
