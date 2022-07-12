# TonGames
<img src="https://user-images.githubusercontent.com/18723798/178425733-c53869d0-2a62-4f66-b573-dcc61b9095af.png" data-canonical-src="https://user-images.githubusercontent.com/18723798/178425733-c53869d0-2a62-4f66-b573-dcc61b9095af.png" width="200" />

## TON games overview

TonGames is an Web3 Multiplayer Framework for TON and Node.js, with clients available for the Web. 

The project focuses on providing synchronizable data structures and channels transactions helpers for realtime web3 and turn-based games, matchmaking, and ease of usage both between many web3 clients.

The mission of the framework is to be a standard netcode & matchmaking solution for any kind of project you can think of web3!

### What TONGames provides to you:
 - WebSocket-based communication between dApp and lite Node
 - Simple and powerful API in the client-side.
 - Automatic state synchronization between dApp and lite Node.
 - Simple and usable Ton Channels adapters which can helps you to interract with.

### What TONGames won't provide:
 - Game Engine
 - Database
 - Rest of buisness logic

## Core concepts
Keep in mind that your dApp game will interract with TonGames lite Node Server. For the full picture of process let's describe each members.

#### TonGames lite Node Server
Simple node.js app which
1) *handle* all game session state changes
2) register all possible well defined dApp actions
3) init and sync app state data with all connected clients
4) provide simple and powerfull api to interract and make payments using Payment channel.
5) Sync PaymentChannel balances.

#### TonGames Dapp client
Client side Javascript app which
1) register all possible state actions
2) init app state 
3) open dApp channel and using handshake
4) handling all server state udpates


## TonGame lite Node Server and TonGames Dapp client interaction.
![](https://i.imgur.com/UtjWtxA.png)

## Simple Black Jack app Demo
Simple dApp demo using TonGames Lite Node server and client

***
```javascript
Quick start guide:

0) git clone git@github.com:Dimitreee/ton_games.git
1) cd ton_games
2) git checkout tmp
3) yarn && yarn dev
// lite Node demo server will be started at localhost:4000
4) open new terminal session
5) cd example/channeled_game
6) yarn && yarn dev
```
Look at the source code for more [server implementation details](https://github.com/Dimitreee/ton_games/blob/tmp/lib/Server.ts) and [client implementation details](https://github.com/Dimitreee/ton_games/blob/master/example/channeled_game/src/App.tsx)


