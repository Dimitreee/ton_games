import { GameServer } from '../lib/Server'

const props = {
    port: process.env.port || 4040,
}

const server = new GameServer(props)

server.init()
