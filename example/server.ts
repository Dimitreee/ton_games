import { GameServer } from '../lib/Server'

const props = {
    port: process.env.port || 8080,
}

const server = new GameServer(props)

server.init()
