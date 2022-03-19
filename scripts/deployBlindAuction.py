from brownie import convert, web3, accounts, BlindAuction
import time
from eth_account.messages import encode_defunct


def main():
    alice = accounts[0]
    bob = accounts[1]
    # 1 minute
    bidding_time = 0.2*60
    reveal_time = 0.2*60
    print("Alice deploy BlindAuction contract...")
    ba = BlindAuction.deploy(
        bidding_time, reveal_time, alice.address, {"from": accounts[0]})
    print(f"Deployed BlindAuction contract at {ba}")

    print_values(alice, bob)
    # Alice's bids
    alice_values = [1, 2, 3]
    alice_fakes = [True, False, True]
    alice_secrets = ["secret1".encode(
        "utf-8"), "secret2".encode("utf-8"), "secret3".encode("utf-8")]
    user_bid(ba, alice, "1 ether",
             alice_values[0], alice_fakes[0], alice_secrets[0])
    user_bid(ba, alice, "2 ether",
             alice_values[1], alice_fakes[1], alice_secrets[1])
    user_bid(ba, alice, "3 ether",
             alice_values[2], alice_fakes[2], alice_secrets[2])
    print_values(alice, bob)

    # Bob's bids
    bob_values = [4, 5]
    bob_fakes = [False, True]
    bob_secrets = ["bob4".encode("utf-8"), "bob5".encode("utf-8")]
    user_bid(ba, bob, "3 ether", bob_values[0], bob_fakes[0], bob_secrets[0])
    user_bid(ba, bob, "4 ether", bob_values[1], bob_fakes[1], bob_secrets[1])
    print_values(alice, bob)

    print(
        f"Waiting {bidding_time} seconds in order to enter to reveal time...")
    time.sleep(bidding_time)
    # Alice reveals his bids
    user_reveal(ba, alice, alice_values, alice_fakes, alice_secrets)
    # Bob reveals his bids
    user_reveal(ba, bob, bob_values, bob_fakes, bob_secrets)

    print(
        f"Waiting {reveal_time} seconds in order to end the auction...")
    time.sleep(reveal_time)

    # Alice and Bob call withdraw()
    print("Alice calls withdraw()...")
    tx = ba.withdraw({"from": alice})
    tx.wait(1)
    print_values(alice, bob)
    print("Bob calls withdraw()...")
    tx = ba.withdraw({"from": bob})
    tx.wait(1)
    print_values(alice, bob)

    # Alice calls auctionEnd()
    print("Alice calls auctionEnd()...")
    tx = ba.auctionEnd({"from": alice})
    tx.wait(1)
    print("Auction ended")
    print_values(alice, bob)


def print_values(_alice, _bob):
    a_bal = web3.fromWei(_alice.balance(), "ether")
    b_bal = web3.fromWei(_bob.balance(), "ether")
    print(f"Alice's balance is {a_bal} ether")
    print(f"Bob's balance is {b_bal} ether")


def user_bid(_ba, _user, _amount, _values, _fakes, _secrets):
    sk = web3.solidityKeccak(["uint256", "bool", "bytes32"], [
                             convert.to_uint(_values, "uint256"), convert.to_bool(_fakes), web3.toHex(convert.to_bytes(_secrets, "bytes32"))])
    print(f"{_user} bid for {_amount}...")
    tx = _ba.bid(sk.hex(), {"from": _user, "amount": _amount})
    tx.wait(1)
    print(f"{_user} bidded for {_amount}!")


def user_reveal(_ba, _user, _values, _fakes, _secrets):
    print(f"{_user} reveal his bids...")
    tx = _ba.reveal(_values, _fakes, _secrets, {"from": _user})
    tx.wait(1)
    print(f"{_user} revealed his bids!")
