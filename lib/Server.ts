import { Server } from 'socket.io'

interface Props {
    port: number
}

export class GameServer {
    constructor(private props: Props) {
    }

    public init() {
        this.server = new Server(this.props.port);

        this.server.on("connection", (soket) => {
            soket.emit("ping");
        })
    }

    private server: Server;
}
