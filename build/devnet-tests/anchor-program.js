"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const anchor = __importStar(require("@project-serum/anchor"));
const web3_js_1 = require("@solana/web3.js");
const buffer_1 = require("buffer");
const js_1 = require("@metaplex-foundation/js");
const idl = JSON.parse(require("fs").readFileSync('../../target/idl/staking_program.json'));
const mpl_token_metadata_1 = require("@metaplex-foundation/mpl-token-metadata");
const spl_token_1 = require("@solana/spl-token");
const const_1 = require("./const");
const utils_1 = require("./utils");
const RPC_ENDPOINT_URL = "https://api.devnet.solana.com";
const commitment = 'confirmed';
const connection = new web3_js_1.Connection(RPC_ENDPOINT_URL, commitment);
const anchorWallet = new anchor.Wallet(utils_1.wallet);
const provider = new anchor.AnchorProvider(connection, anchorWallet, {});
anchor.setProvider(provider);
const programId = new web3_js_1.PublicKey("6s3muoRZnpcQ5jjUqPz1Ra9kyWAqiDbXexMmJJegAjRV");
//const idlAcct = new PublicKey("12CgKLioF23zhpNFHTAYuGYS78SqmGa2w9anXv9kXrrb")
const program = new anchor.Program(idl, programId);
const metaplex = js_1.Metaplex.make(connection)
    .use((0, js_1.keypairIdentity)(utils_1.wallet))
    .use((0, js_1.bundlrStorage)());
function testStakingProgram() {
    return __awaiter(this, void 0, void 0, function* () {
        const nft = yield metaplex.nfts().create({
            uri: "",
            name: "Test nft",
            sellerFeeBasisPoints: 0
        }).run();
        console.log("nft metadata pubkey: ", nft.metadataAddress.toBase58());
        console.log("nft token address: ", nft.tokenAddress.toBase58());
        let delegatedAuthPda = yield web3_js_1.PublicKey.findProgramAddress([buffer_1.Buffer.from("authority")], programId);
        let stakeStatePda = yield web3_js_1.PublicKey.findProgramAddress([utils_1.wallet.publicKey.toBuffer(), nft.tokenAddress.toBuffer()], programId);
        console.log("delegated authority pda: ", delegatedAuthPda[0].toBase58());
        console.log("stake state pda: ", stakeStatePda[0].toBase58());
        const txid = yield program.methods.stake()
            .accounts({
            user: utils_1.wallet.publicKey,
            nftTokenAccount: nft.tokenAddress,
            nftMint: nft.mintAddress,
            nftEdition: nft.masterEditionAddress,
            stakeState: stakeStatePda[0],
            programAuthority: delegatedAuthPda[0],
            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
            metadataProgram: mpl_token_metadata_1.PROGRAM_ID,
            systemProgram: web3_js_1.SystemProgram.programId
        }).rpc();
        console.log("Stake tx:");
        console.log(`https://explorer.solana.com/tx/${txid}?cluster=devnet`);
        console.log("Sleeping for 2 sec...");
        yield (0, utils_1.delay)(2000);
        // redeeming rewards
        let mintAuth = yield web3_js_1.PublicKey.findProgramAddress([buffer_1.Buffer.from("mint")], programId);
        let userStakeAta = yield (0, spl_token_1.getOrCreateAssociatedTokenAccount)(connection, utils_1.wallet, const_1.anchorStakeMint, utils_1.wallet.publicKey);
        const redeemTxid = yield program.methods.redeem()
            .accounts({
            user: utils_1.wallet.publicKey,
            nftTokenAccount: nft.tokenAddress,
            stakeState: stakeStatePda[0],
            stakeMint: const_1.anchorStakeMint,
            stakeAuthority: mintAuth[0],
            userStakeAta: userStakeAta.address,
            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID
        }).rpc();
        console.log("Redeem tx:");
        console.log(`https://explorer.solana.com/tx/${redeemTxid}?cluster=devnet`);
        const unstakeTxid = yield program.methods.unstake()
            .accounts({
            user: utils_1.wallet.publicKey,
            nftTokenAccount: nft.tokenAddress,
            nftMint: nft.mintAddress,
            nftEdition: nft.masterEditionAddress,
            stakeState: stakeStatePda[0],
            programAuthority: delegatedAuthPda[0],
            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
            metadataProgram: mpl_token_metadata_1.PROGRAM_ID
        }).rpc();
        console.log("Unstake tx:");
        console.log(`https://explorer.solana.com/tx/${unstakeTxid}?cluster=devnet`);
    });
}
testStakingProgram();
