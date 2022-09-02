"use strict";
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
exports.createTokenMint = exports.delay = exports.wallet = exports.program_id = void 0;
const web3_js_1 = require("@solana/web3.js");
const buffer_1 = require("buffer");
const spl_token_1 = require("@solana/spl-token");
exports.program_id = new web3_js_1.PublicKey("FQkajEMvJ61JDaW41cNQaUnHTK1Kv5CVe4bJXJXWF3JQ");
const RPC_ENDPOINT_URL = "https://api.devnet.solana.com";
const commitment = 'confirmed';
const connection = new web3_js_1.Connection(RPC_ENDPOINT_URL, commitment);
// MY WALLET SETTING
const id_json_path = require('os').homedir() + "/.config/solana/test-wallet.json";
const secret = Uint8Array.from(JSON.parse(require("fs").readFileSync(id_json_path)));
exports.wallet = web3_js_1.Keypair.fromSecretKey(secret);
function delay(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}
exports.delay = delay;
function createTokenMint() {
    return __awaiter(this, void 0, void 0, function* () {
        let mintAuth = yield web3_js_1.PublicKey.findProgramAddress([buffer_1.Buffer.from("mint")], exports.program_id);
        let mint = yield (0, spl_token_1.createMint)(connection, exports.wallet, mintAuth[0], null, 6);
        console.log("Mint pubkey: ", mint.toBase58());
    });
}
exports.createTokenMint = createTokenMint;
