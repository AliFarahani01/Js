const Web3 = require('web3');

// تنظیمات اولیه
const web3 = new Web3('https://mainnet.infura.io/v3/f77e36ab197d4eaf96ec70f6dbf0d88b''); // نود Infura (یا Alchemy)
const privateKey = '5d89212241cf735f824a4219b2c5fe6a5cde395fa9b5a5b84d3ce069a7054345'; // کلید خصوصی کیف پول (هرگز در کد عمومی نذار!)
const fromAddress = '0x1D3247aa7a3fa22cEd2616754Dc2eCf37743E875'; // آدرس کیف پولت
const toAddress = 'RECIPIENT_ADDRESS'; // آدرس گیرنده
const usdtContractAddress = '0x62FC363677Be2BCa25Eb39755FF9a1eA4bCB8ECE'; // آدرس USDT در اتریوم
const amount = '1000000'; // مقدار تتر (مثلاً 1 USDT، چون USDT 6 رقم اعشار داره: 1 USDT = 1000000)

// ABI قرارداد USDT (فقط تابع transfer)
const usdtAbi = [
    {
        "constant": false,
        "inputs": [
            { "name": "_to", "type": "address" },
            { "name": "_value", "type": "uint256" }
        ],
        "name": "transfer",
        "outputs": [{ "name": "", "type": "bool" }],
        "type": "function"
    }
];

// اتصال به قرارداد USDT
const usdtContract = new web3.eth.Contract(usdtAbi, usdtContractAddress);

async function sendPendingUSDT() {
    try {
        // تنظیم Gas Price پایین برای Pending ماندن
        const gasPrice = web3.utils.toWei('1', 'gwei'); // Gas Price خیلی پایین (مثلاً 1 Gwei)
        const gasLimit = 60000; // Gas Limit برای تراکنش USDT

        // بررسی موجودی ETH برای پرداخت Gas
        const balance = await web3.eth.getBalance(fromAddress);
        console.log('ETH Balance:', web3.utils.fromWei(balance, 'ether'), 'ETH');
        if (balance === '0') {
            throw new Error('Insufficient ETH for gas fees');
        }

        // ساخت تراکنش
        const tx = {
            from: fromAddress,
            to: usdtContractAddress,
            gas: gasLimit,
            gasPrice: gasPrice,
            data: usdtContract.methods.transfer(toAddress, amount).encodeABI()
        };

        // امضای تراکنش با کلید خصوصی
        const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);

        // ارسال تراکنش
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction)
            .on('transactionHash', (hash) => {
                console.log('Transaction Hash:', hash);
                console.log('Check on Etherscan:', `https://etherscan.io/tx/${hash}`);
            });

        console.log('Transaction Confirmed:', receipt);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// اجرای اسکریپت
sendPendingUSDT();
