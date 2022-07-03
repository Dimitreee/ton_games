import { Server } from 'socket.io'
import { StateManager } from './StateManager';

const TonWeb = require("tonweb");
const Mnemonic = require("tonweb-mnemonic")

const BN = TonWeb.utils.BN;
const toNano = TonWeb.utils.toNano;

const PROVIDER_URL = 'https://testnet.toncenter.com/api/v2/jsonRPC';
const API_KEY = '2c929a2d19741dc360559f0cc120547ad1042c6e21600bcaf5e4c645191f444e';
const PROVIDER = new TonWeb.HttpProvider(PROVIDER_URL, { apiKey: API_KEY })
const TONWEB = new TonWeb(PROVIDER);
const UTILS = TonWeb.utils;

interface Props {
    port: any
}

const SERVER_MNEMONIC = "palace,version,hidden,impulse,digital,awake,achieve,evolve,mercy,typical,mimic,nut,spawn,zebra,trigger,refuse,primary,toddler,manage,east,stock,minor,resource,script"

export class GameServer {
    constructor(private props: Props) {
        this.state = new StateManager();

        Mnemonic.mnemonicToKeyPair(SERVER_MNEMONIC.split(","))
            .then((data: any) => {
                this.serverKeyPair = data
            })
            .then(() => {
                this.wallet = new TONWEB.wallet.all.v3R2(PROVIDER, {
                    publicKey: this.serverKeyPair.publicKey,
                });
            })
            .then(() => {
                this.wallet.getAddress().then((data: any) => {
                    this.walletAddress = data
                })
            })
    }

    public init() {
        this.server = new Server(
            this.props.port,
            {
                cors: {
                    "origin": "*",
                    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
                },
                allowRequest: (req, callback) => {
                    callback(null, true); // cross-origin requests will not be allowed
                }
            }
        );

        const channelInitState = {
            balanceA: toNano('1'),
            balanceB: toNano('1'),
            seqnoA: new BN(0),
            seqnoB: new BN(0),
        };

        this.server.on("connection", (connectedSocket) => {
            this.state.setSocket(connectedSocket.id, {
                socket: connectedSocket
            })

            connectedSocket.on("changeState", (state) => {
                this.state.set(connectedSocket.id, { state })
            })

            connectedSocket.on("resetState", (initialState) => {
                const prevState = this.state.get(connectedSocket.id);

                const {
                    socket,
                    onUpdate,
                    state,
                    channel,
                    channelAddress,
                    channelId,
                    dealerPublicKey,
                    dealerWalletAddress,
                } = prevState;

                this.state.set(
                    socket.id, {
                        socket,
                        onUpdate,
                        channel,
                        channelId,
                        dealerPublicKey,
                        dealerWalletAddress,
                        channelAddress,
                        state: {
                            ...initialState,
                            balance: state.balance,
                            channelState: state.channelState
                        }
                    }
                )
            })

            connectedSocket.on("initChannel", (secret) => {
                console.log('initChannel', secret)
                const prevState = this.state.get(connectedSocket.id);

                const userPublicKey = UTILS.base64ToBytes(prevState.state.userPublicKey)
                const userWallet = new TONWEB.wallet.all.v3R2(PROVIDER, {
                    publicKey: userPublicKey,
                });

                const channelId = new BN(secret)

                userWallet.getAddress().then((userWalletAddress: any) => {
                    const channelConfig = {
                        channelId: channelId,
                        addressA: this.walletAddress,
                        addressB: userWalletAddress,
                        initBalanceA: channelInitState.balanceA,
                        initBalanceB: channelInitState.balanceB
                    }

                    const channel = TONWEB.payments.createChannel({
                        ...channelConfig,
                        isA: true,
                        myKeyPair: this.serverKeyPair,
                        hisPublicKey: userPublicKey
                    });

                    channel.getAddress().then((address: any) => {
                        console.log("\\nChannelAddress: ", address.toString(true))
                        this.state.set(
                            connectedSocket.id, {
                                channel,
                                state: {
                                    channelAddress: address.toString(),
                                    channelId: channelId,
                                    dealerPublicKey: UTILS.bytesToBase64(this.serverKeyPair.publicKey),
                                    dealerWalletAddress: this.walletAddress,
                                    channelState: {
                                        balanceA: channelInitState.balanceA.toNumber(),
                                        balanceB: channelInitState.balanceB.toNumber(),
                                        seqnoA: channelInitState.seqnoA.toNumber(),
                                        seqnoB: channelInitState.seqnoB.toNumber(),
                                    }
                                }
                            }
                        )
                    })
                })
            })

            connectedSocket.on("initOffchain" , () => {
                console.log("initOffchain")
                const state = this.state.get(connectedSocket.id);

                const fromServer = state.channel.fromWallet({
                    wallet: this.wallet,
                    secretKey: this.serverKeyPair.secretKey
                });

                fromServer.deploy().send(toNano('0.05')).then((deployInfo: any) => {
                    setTimeout(() => {
                        state.channel.getChannelState()
                            .then((channelState: any) => {
                                console.log("Channel state: ", channelState);

                                return state.channel.getData()
                            })
                            .then((channelData: any) => {
                                const balanceA = channelData.balanceA.toString();
                                const balanceB = channelData.balanceB.toString();

                                console.log('balanceA = ', balanceA)
                                console.log('balanceB = ', balanceB)

                                console.log('\ninit server wallet balance', balanceB)

                                this.state.set(
                                    connectedSocket.id,
                                    {
                                        state: {
                                            dealerBalance: balanceA,
                                            userBalance: balanceB
                                        }
                                    }
                                )

                                fromServer
                                    .topUp({ coinsA: channelInitState.balanceA, coinsB: new BN(0) })
                                    .send(channelInitState.balanceA.add(toNano('0.05')));

                                state.socket.emit("offChainInit", {
                                    deployInfo,
                                    balanceA,
                                    balanceB,
                                })
                            })

                    }, 10000)
                });
            })

            connectedSocket.on("initDapp", () => {
                const state = this.state.get(connectedSocket.id);

                const fromServer = state.channel.fromWallet({
                    wallet: this.wallet,
                    secretKey: this.serverKeyPair.secretKey
                });

                fromServer.init(channelInitState).send(toNano('0.05')).then((res: any) => {
                    if (res['@type'] === "ok") {
                        setTimeout(() => {
                            state.socket.emit("channelIsOpen")
                            console.log("channelIsOpen", res['@type']);
                        }, 10000)
                    }
                });
            })

            connectedSocket.on("closeDappChannel", (payload) => {
                console.log("closeDappChannel")
                const sessionState = this.state.get(connectedSocket.id);

                const fromServer = sessionState.channel.fromWallet({
                    wallet: this.wallet,
                    secretKey: this.serverKeyPair.secretKey
                });

                console.log("closeChannel", sessionState.state.channelState, payload)
                fromServer.close({
                    ...sessionState.state.channelState,
                    hisSignature: new Uint8Array(payload)
                })
                    .send(toNano('0.05'))
                    .then((res: any)=> {
                        console.log('channel closed:', res)
                        sessionState.socket.emit("channelClosed")
                    });
            })

            connectedSocket.on("sign", (payload) => {
                const socketState = this.state.get(connectedSocket.id);
                const {state, signedState} = payload

                const nextState = {
                    balanceA: new BN(state.balanceA),
                    balanceB: new BN(state.balanceB),
                    seqnoA: new BN(state.seqnoA),
                    seqnoB: new BN(state.seqnoB)
                }

                socketState.channel.verifyState(nextState, signedState).then((res: any) => {
                    console.log("verify res: ", { res, state, signedState })
                })

                console.log("\nsign\n", nextState)

                socketState.channel.signState(nextState).then((res: any) => {
                    console.log("signed: ", {nextState, res})

                    console.log("nextState: ", state)
                    this.state.set(connectedSocket.id, {
                        state: { channelState: {...state} }
                    })

                    setTimeout(() => {
                        socketState.channel.getChannelState()
                            .then((channelState: any) => {
                                console.log("Channel state: ", channelState);

                                return socketState.channel.getData()
                            })
                            .then((channelData: any) => {
                                const balanceA = channelData.balanceA.toString();
                                const balanceB = channelData.balanceB.toString();

                                console.log('balanceA = ', balanceA)
                                console.log('balanceB = ', balanceB)

                                this.state.set(
                                    connectedSocket.id,
                                    {
                                        state: {
                                            dealerBalance: balanceA,
                                            userBalance: balanceB
                                        }
                                    }
                                )
                            })
                    }, 100)
                });

            })
        })
    }

    private server: Server;
    private state: StateManager;
    private serverKeyPair: any;
    private wallet: any;
    private walletAddress: any;
}

