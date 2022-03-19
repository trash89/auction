from brownie import accounts, SimpleAuction
import time


def main():
    alice = accounts[0]
    bob = accounts[0]
    # 1 minute
    bidding_time = 1*60
    print("Alice deploy SimpleAuction contract...")
    sa = SimpleAuction.deploy(
        bidding_time, alice.address, {"from": accounts[0]})
    print(f"Deployed SimpleAuction contract at {sa}")

    print("Alice bid for 1 ether...")
    tx = sa.bid({"from": alice, "amount": "1 ether"})
    tx.wait(1)
    print("Alice bided for 1 ether")

    print("Bob bid for 2 ether...")
    tx = sa.bid({"from": bob, "amount": "2 ether"})
    tx.wait(1)
    print("Bob bided for 2 ether")

    print("Alice withdraw her bid...")
    tx = sa.withdraw({"from": alice})
    tx.wait(1)
    print(f"Alice withdrawed() her bid? {tx.return_value}")

    print(f"Waiting {bidding_time} seconds in order to finish the auction...")
    time.sleep(bidding_time)
    print("Alice calls auctionEnd()...")
    tx = sa.auctionEnd({"from": alice})
    print("Alice called auctionEnd()")
