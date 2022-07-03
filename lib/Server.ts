import { Server } from 'socket.io'
import { StateManager } from './StateManager';

const TonWeb = require("tonweb");
const Mnemonic = require("tonweb-mnemonic")

const BN = TonWeb.utils.BN;
const toNano = TonWeb.utils.toNano;

const providerUrl = 'https://testnet.toncenter.com/api/v2/jsonRPC';
const apiKey = '';
const provider = new TonWeb.HttpProvider(providerUrl, {apiKey})
const tonweb = new TonWeb(provider);



interface Props {
    port: number
}

export class GameServer {
    constructor(private props: Props) {
        this.state = new StateManager();
        const serverMnemonic = "palace,version,hidden,impulse,digital,awake,achieve,evolve,mercy,typical,mimic,nut,spawn,zebra,trigger,refuse,primary,toddler,manage,east,stock,minor,resource,script"
        Mnemonic.mnemonicToKeyPair(serverMnemonic.split(","))
            .then((data: any) => {
                this.serverKeyPair = data
            }).then(() => {
                this.wallet = new tonweb.wallet.all.v3R2(provider, {
                    publicKey: this.serverKeyPair.publicKey,
                });
            }).then(() => {
                this.wallet.getAddress().then((data: any) => {
                    this.walletAddress = data.toString(true, true, true)
                })
        })

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
            this.state.setSocket(connectedSocket.id, { socket: connectedSocket })

            connectedSocket.on("changeState", (state) => {
                this.state.set(connectedSocket.id, { state })
            })

            connectedSocket.on("resetState", (initialState) => {
                const prevState = this.state.get(connectedSocket.id);

                const { socket, onUpdate, state } = prevState;

                this.state.set(socket.id, { socket, onUpdate, state: { ...initialState, balance: state.balance }, })
            })

            connectedSocket.on("initChannel", () => {
                this.state.set(connectedSocket.id, {
                    dealerPublicKey: this.serverKeyPair.publicKey,
                    dealerWalletAddress: this.walletAddress
                })
            })
        })
    }

    private server: Server;
    private state: StateManager;
    private serverKeyPair: any;
    private wallet: any;
    private walletAddress: any;
}

