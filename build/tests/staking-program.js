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
const js_1 = require("@metaplex-foundation/js");
const mpl_token_metadata_1 = require("@metaplex-foundation/mpl-token-metadata");
const spl_token_1 = require("@solana/spl-token");
// MY WALLET SETTING
const id_json_path = require('os').homedir() + "/.config/solana/test-wallet.json";
const secret = Uint8Array.from(JSON.parse(require("fs").readFileSync(id_json_path)));
const wallet = web3_js_1.Keypair.fromSecretKey(secret);
// Configure the client to use the local cluster.
anchor.setProvider(anchor.AnchorProvider.env());
let envProvider = anchor.AnchorProvider.env();
const provider = new anchor.AnchorProvider(envProvider.connection, new anchor.Wallet(wallet), envProvider.opts);
let connection = provider.connection;
const program = anchor.workspace.StakingProgram;
describe("staking-program", () => __awaiter(void 0, void 0, void 0, function* () {
    const metaplex = js_1.Metaplex.make(connection)
        .use((0, js_1.keypairIdentity)(wallet))
        .use((0, js_1.bundlrStorage)());
    const nft = yield metaplex.nfts().create({
        uri: "",
        name: "Test nft",
        sellerFeeBasisPoints: 0
    }).run();
    console.log("nft metadata pubkey: ", nft.metadataAddress.toBase58());
    console.log("nft token address: ", nft.tokenAddress.toBase58());
    let delegatedAuthPda = yield web3_js_1.PublicKey.findProgramAddress([Buffer.from("authority")], program.programId);
    let stakeStatePda = yield web3_js_1.PublicKey.findProgramAddress([wallet.publicKey.toBuffer(), nft.tokenAddress.toBuffer()], program.programId);
    console.log("delegated authority pda: ", delegatedAuthPda[0].toBase58());
    console.log("stake state pda: ", stakeStatePda[0].toBase58());
    it("test part 1", () => {
        console.log("Fake test part 1");
    });
    it("Stake nft!", () => __awaiter(void 0, void 0, void 0, function* () {
        console.log("Running first test");
        // Add your test here.
        const txid = yield program.methods.stake()
            .accounts({
            user: wallet.publicKey,
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
    }));
    it("test part 2", () => {
        console.log("fake test part 2");
    });
}));
