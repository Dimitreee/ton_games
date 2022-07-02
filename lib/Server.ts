import { Server } from 'socket.io';
import { StateManager } from './StateManager';

interface Props {
    port: number
    initialState: Record<any, any>
}

export class GameServer {
    constructor(private props: Props) {
        this.state = new StateManager();
    }

    public init() {
        this.server = new Server(
            this.props.port, {
                cors: {
                    origin: 'http://localhost:3000',
                    credentials: true,
                },
            }
        );

        this.server.on("connection", (connectedSocket) => {
            this.state.initState(connectedSocket.id, { socket: connectedSocket, state: this.props.initialState })

            connectedSocket.on("changeState", (state) => {
                this.state.set(connectedSocket.id, { state })
            })

            connectedSocket.on("resetState", () => {
                const prevState = this.state.get(connectedSocket.id);

                const { socket, onUpdate, state } = prevState;

                this.state.set(socket.id, { socket, onUpdate, state: { ...this.props.initialState, balance: state.balance }, })
            })
        })
    }

    private server: Server;
    private state: StateManager;
}

