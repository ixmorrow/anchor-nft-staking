import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { StakingProgram } from "../target/types/staking_program";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { Metaplex, bundlrStorage, keypairIdentity } from "@metaplex-foundation/js"
import { PROGRAM_ID as METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";
import {TOKEN_PROGRAM_ID } from '@solana/spl-token'


// MY WALLET SETTING
const id_json_path = require('os').homedir() + "/.config/solana/test-wallet.json"
const secret = Uint8Array.from(JSON.parse(require("fs").readFileSync(id_json_path)))
const wallet = Keypair.fromSecretKey(secret as Uint8Array)

// Configure the client to use the local cluster.
anchor.setProvider(anchor.AnchorProvider.env())
let envProvider = anchor.AnchorProvider.env()
const provider = new anchor.AnchorProvider(envProvider.connection, new anchor.Wallet(wallet), envProvider.opts)
let connection = provider.connection
const program = anchor.workspace.StakingProgram as Program<StakingProgram>;


describe("staking-program", async () => {

  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(wallet))
    .use(bundlrStorage())

  const nft = await metaplex.nfts().create({
    uri: "",
    name: "Test nft",
    sellerFeeBasisPoints: 0
  }).run()

  console.log("nft metadata pubkey: ", nft.metadataAddress.toBase58())
  console.log("nft token address: ", nft.tokenAddress.toBase58())

  let delegatedAuthPda = await PublicKey.findProgramAddress([Buffer.from("authority")], program.programId)
  let stakeStatePda = await PublicKey.findProgramAddress([wallet.publicKey.toBuffer(), nft.tokenAddress.toBuffer()], program.programId)

  console.log("delegated authority pda: ", delegatedAuthPda[0].toBase58())
  console.log("stake state pda: ", stakeStatePda[0].toBase58())

  it("test part 1", () => {
    console.log("Fake test part 1")
  })

  it("Stake nft!", async () => {
    console.log("Running first test")
    // Add your test here.
    const txid = await program.methods.stake()
      .accounts({
        user: wallet.publicKey,
        nftTokenAccount: nft.tokenAddress,
        nftMint: nft.mintAddress,
        nftEdition: nft.masterEditionAddress,
        stakeState: stakeStatePda[0],
        programAuthority: delegatedAuthPda[0],
        tokenProgram: TOKEN_PROGRAM_ID,
        metadataProgram: METADATA_PROGRAM_ID,
        systemProgram: SystemProgram.programId
      }).rpc()
      console.log("Stake tx:")
      console.log(`https://explorer.solana.com/tx/${txid}?cluster=devnet`)
  })

  it("test part 2", () => {
    console.log("fake test part 2")
  })
})
