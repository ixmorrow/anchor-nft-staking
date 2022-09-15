import * as anchor from "@project-serum/anchor"
import { PublicKey, Connection, SystemProgram } from "@solana/web3.js"
import { Buffer } from "buffer"
import {
  Metaplex,
  bundlrStorage,
  keypairIdentity,
} from "@metaplex-foundation/js"
const idl = JSON.parse(
  require("fs").readFileSync("../../target/idl/staking_program.json")
)
import { PROGRAM_ID as METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata"
import {
  TOKEN_PROGRAM_ID,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token"
import { anchorStakeMint as stakeMint } from "./const"
import { wallet, delay } from "./utils"

const RPC_ENDPOINT_URL = "https://api.devnet.solana.com"
const commitment = "confirmed"
const connection = new Connection(RPC_ENDPOINT_URL, commitment)

const anchorWallet = new anchor.Wallet(wallet)
const provider = new anchor.AnchorProvider(connection, anchorWallet, {})
anchor.setProvider(provider)
const programId = new PublicKey("6s3muoRZnpcQ5jjUqPz1Ra9kyWAqiDbXexMmJJegAjRV")
//const idlAcct = new PublicKey("12CgKLioF23zhpNFHTAYuGYS78SqmGa2w9anXv9kXrrb")
const program = new anchor.Program(idl, programId)

const metaplex = Metaplex.make(connection)
  .use(keypairIdentity(wallet))
  .use(bundlrStorage())

async function testStakingProgram() {
  const nft = await metaplex
    .nfts()
    .create({
      uri: "",
      name: "Test nft",
      sellerFeeBasisPoints: 0,
    })
    .run()

  console.log(nft.nft)

  console.log("nft metadata pubkey: ", nft.metadataAddress.toBase58())
  console.log("nft token address: ", nft.tokenAddress.toBase58())

  let delegatedAuthPda = await PublicKey.findProgramAddress(
    [Buffer.from("authority")],
    programId
  )
  let stakeStatePda = await PublicKey.findProgramAddress(
    [wallet.publicKey.toBuffer(), nft.tokenAddress.toBuffer()],
    programId
  )

  console.log("delegated authority pda: ", delegatedAuthPda[0].toBase58())
  console.log("stake state pda: ", stakeStatePda[0].toBase58())

  const txid = await program.methods
    .stake()
    .accounts({
      user: wallet.publicKey,
      nftTokenAccount: nft.tokenAddress,
      nftMint: nft.mintAddress,
      nftEdition: nft.masterEditionAddress,
      stakeState: stakeStatePda[0],
      programAuthority: delegatedAuthPda[0],
      tokenProgram: TOKEN_PROGRAM_ID,
      metadataProgram: METADATA_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .rpc()
  console.log("Stake tx:")
  console.log(`https://explorer.solana.com/tx/${txid}?cluster=devnet`)

  console.log("Sleeping for 2 sec...")
  await delay(2000)

  // redeeming rewards
  let mintAuth = await PublicKey.findProgramAddress(
    [Buffer.from("mint")],
    programId
  )
  let userStakeAta = await getOrCreateAssociatedTokenAccount(
    connection,
    wallet,
    stakeMint,
    wallet.publicKey
  )

  const redeemTxid = await program.methods
    .redeem()
    .accounts({
      user: wallet.publicKey,
      nftTokenAccount: nft.tokenAddress,
      stakeState: stakeStatePda[0],
      stakeMint: stakeMint,
      stakeAuthority: mintAuth[0],
      userStakeAta: userStakeAta.address,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .rpc()

  console.log("Redeem tx:")
  console.log(`https://explorer.solana.com/tx/${redeemTxid}?cluster=devnet`)

  const unstakeTxid = await program.methods
    .unstake()
    .accounts({
      user: wallet.publicKey,
      nftTokenAccount: nft.tokenAddress,
      nftMint: nft.mintAddress,
      nftEdition: nft.masterEditionAddress,
      stakeState: stakeStatePda[0],
      programAuthority: delegatedAuthPda[0],
      tokenProgram: TOKEN_PROGRAM_ID,
      metadataProgram: METADATA_PROGRAM_ID,
    })
    .rpc()

  console.log("Unstake tx:")
  console.log(`https://explorer.solana.com/tx/${unstakeTxid}?cluster=devnet`)
}

testStakingProgram()
