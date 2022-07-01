import { GameServer } from '../lib/Server';

const props = {
    port: 3000
}
const server = new GameServer(props)

server.init()
