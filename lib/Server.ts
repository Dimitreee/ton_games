import { Server, Socket } from 'socket.io'
import { StateManager } from './StateManager';

export interface Controller {
    onEvent: (event: string, data: any) => void
    setSocket: (socket: Socket) => void
    setState: (state: StateManager) => void
}

interface Props {
    port: number
    initialState: Record<any, any>
    controller: Controller
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

            connectedSocket.on("*", (event, data) => {
                this.props.controller.onEvent(event, data)
            });

            this.props.controller.setSocket(connectedSocket);
        })
    }

    private server: Server;
    private state: StateManager;
}

