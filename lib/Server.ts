import { Server } from 'socket.io'
import { StateManager } from './StateManager';

const TonWeb = require("tonweb");
const Mnemonic = require("tonweb-mnemonic")

const BN = TonWeb.utils.BN;
const toNano = TonWeb.utils.toNano;

const providerUrl = 'https://testnet.toncenter.com/api/v2/jsonRPC';
const apiKey = '2c929a2d19741dc360559f0cc120547ad1042c6e21600bcaf5e4c645191f444e';
const provider = new TonWeb.HttpProvider(providerUrl, {apiKey})
const tonweb = new TonWeb(provider);


const utils = TonWeb.utils;


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
                    this.walletAddress = data
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
                const prevState = this.state.get(connectedSocket.id);
                const channelInitState = {
                    balanceA: toNano('3'), // A's initial balance in Toncoins. Next A will need to make a top-up for this amount
                    balanceB: toNano('3'), // B's initial balance in Toncoins. Next B will need to make a top-up for this amount
                    seqnoA: new BN(0), // initially 0
                    seqnoB: new BN(0)  // initially 0
                };

                const userPublicKey = utils.base64ToBytes(prevState.state.userPublicKey)
                const userWallet = new tonweb.wallet.all.v3R2(provider, {
                    publicKey: userPublicKey,
                });

                const channelId = new BN(+new Date)

                userWallet.getAddress().then((userWalletAddress: any) => {
                    const channelConfig = {
                        channelId: new BN(channelId), // Channel ID, for each new channel there must be a new ID
                        addressA: this.walletAddress, // A's funds will be withdrawn to this wallet address after the channel is closed
                        addressB: userWalletAddress, // B's funds will be withdrawn to this wallet address after the channel is closed
                        initBalanceA: channelInitState.balanceA,
                        initBalanceB: channelInitState.balanceB
                    }

                    const channel = tonweb.payments.createChannel({
                        ...channelConfig,
                        isA: true,
                        myKeyPair: this.serverKeyPair,
                        hisPublicKey: userPublicKey
                    });
                    channel.getAddress().then((data: any) => {
                        this.state.set(connectedSocket.id, { channel, state: {channelAddress: data, channelId: channelId} })
                    })
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

