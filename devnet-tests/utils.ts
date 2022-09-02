import { PublicKey, Keypair, Connection } from "@solana/web3.js"
import { Buffer } from 'buffer'
import { createMint } from '@solana/spl-token'

export const program_id = new PublicKey("FQkajEMvJ61JDaW41cNQaUnHTK1Kv5CVe4bJXJXWF3JQ")

const RPC_ENDPOINT_URL = "https://api.devnet.solana.com"
const commitment = 'confirmed'
const connection = new Connection(RPC_ENDPOINT_URL, commitment)

// MY WALLET SETTING
const id_json_path = require('os').homedir() + "/.config/solana/test-wallet.json"
const secret = Uint8Array.from(JSON.parse(require("fs").readFileSync(id_json_path)))
export const wallet = Keypair.fromSecretKey(secret as Uint8Array)

export function delay(milliseconds : number) {
    return new Promise(resolve => setTimeout( resolve, milliseconds));
}

export async function createTokenMint(){
    let mintAuth = await PublicKey.findProgramAddress([Buffer.from("mint")], program_id)
    let mint = await createMint(
        connection,
        wallet,
        mintAuth[0],
        null,
        6,
    )
    console.log("Mint pubkey: ", mint.toBase58())
}