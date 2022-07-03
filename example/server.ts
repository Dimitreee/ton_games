import { GameServer } from '../lib/Server'

const props = {
    port: 4040,
}

const server = new GameServer(props)

server.init()
