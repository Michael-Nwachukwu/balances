import { BigInt } from "@graphprotocol/graph-ts"
import { Rose, Approval, Transfer } from "../generated/Rose/Rose"
import { User, Transfers, OwnershipTransferred, Approvals } from "../generated/schema"
import { Address } from '@graphprotocol/graph-ts'

export function handleApproval(event: Approval): void {
  let approval = new Approvals(
    event.transaction.hash
      .toHexString() 
      .concat("-")
      .concat(event.logIndex.toString())
  );
  approval.owner = event.params.owner.toHexString();
  approval.spender = event.params.spender.toHexString();
  approval.value = event.params.value;
  approval.timestamp = event.block.timestamp;
  approval.block = event.block.number;
  approval.save();
}

export function handleTransfer(event: Transfer): void {
  let contract = Rose.bind(Address.fromString("0xfBF2a9f8ffab5a8ED186151d9CFa360911Abd6Fd"))

  let fromUser = User.load(event.params.from.toHex());
  if (!fromUser) {
    fromUser = new User(event.params.from.toHex());
    fromUser.owner = event.params.from.toHexString();
    fromUser.balance = BigInt.fromI32(0);
    let balanceResult = contract.try_balanceOf(event.params.from)
    if (!balanceResult.reverted) {
      fromUser.balance = balanceResult.value;
    }
  }
  fromUser.save()
  
  let toUser = User.load(event.params.to.toHex());
  if (!toUser) {
    toUser = new User(event.params.to.toHex());
    toUser.owner = event.params.to.toHexString();
    toUser.balance = BigInt.fromI32(0);
    let balanceResult = contract.try_balanceOf(event.params.to)
    if (!balanceResult.reverted) {
      toUser.balance = balanceResult.value;
    }
  }
  toUser.save()
  
  // Create transfer entity
  let transfer = new Transfers(
    event.transaction.hash
      .toHexString()
      .concat("-")
      .concat(event.logIndex.toString())
  )
  
  transfer.from = fromUser.id
  transfer.to = toUser.id
  transfer.value = event.params.value
  transfer.timestamp = event.block.timestamp
  
  transfer.save()
}