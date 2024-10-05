import { BigInt } from "@graphprotocol/graph-ts"
import { Rose, Approval, Transfer } from "../generated/Rose/Rose"
import { User, Transfers, OwnershipTransferred, Approvals } from "../generated/schema"
import { Address } from '@graphprotocol/graph-ts'

export function handleApproval(event: Approval): void {
  // Create a new Approval entity to record this event
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

  let contract = Rose.bind(Address.fromString("0x..."))

  let user = User.load(event.params.from.toHex());
  if (user == null) {
    user = new User(event.params.from.toHex());
    user.balance = BigInt.fromI32(0);
    let balanceResult = contract.try_balanceOf(Address.fromString(event.params.from.toHexString()))
    // user.token = event.address.toString();
  }

  // Save updated user balances
  user.save()
  
  // Create transfer entity
  let transfer = new Transfers(
    event.transaction.hash
      .toHexString()
      .concat("-")
      .concat(event.logIndex.toString())
  )
  
  let fromUser = User.load(event.params.from.toHexString())
  if (!fromUser) {
    fromUser = new User(event.params.from.toHexString())
    fromUser.owner = event.params.from.toHexString();
    fromUser.balance = BigInt.fromI32(0)
    fromUser.save()
  }

  let toUser = User.load(event.params.to.toHexString())
  if (!toUser) {
    toUser = new User(event.params.to.toHexString())
    toUser.owner = event.params.to.toHexString();
    toUser.balance = BigInt.fromI32(0)
    toUser.save()
  }

  transfer.from = fromUser.id
  transfer.to = toUser.id
  transfer.value = event.params.value
  transfer.timestamp = event.block.timestamp
  
  transfer.save()
}
