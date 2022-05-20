from brownie import convert, config, accounts, network,  MultiSigWallet, TestContract
from web3 import Web3
from scripts.helpful_scripts import get_account, update_front_end, LOCAL_BLOCKCHAIN_ENVIRONMENTS

import eth_abi
import random

DECIMALS = 10**18


def main():
    multiSigWallet, testContract = deploy_contracts(
        get_account(), update_frontend_flag=config["networks"][network.show_active()]["update_frontend"])
    print_values(multiSigWallet, testContract)
    fund_contract(multiSigWallet, "5 gwei", get_account())
    print_values(multiSigWallet, testContract)
    randomValue = random.randint(0, 1000)
    tx = create_and_confirm_tx(
        multiSigWallet, testContract, randomValue, get_account())
    execute_tx(tx, multiSigWallet, get_account())
    print_values(multiSigWallet, testContract)


def params_msw():
    if network.show_active() in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        owners = [accounts[0].address,
                  accounts[1].address, accounts[2].address]
        numConfirm = len(owners)-1
    else:
        owners = [get_account()]
        numConfirm = 1
    return owners, numConfirm


def deploy_contracts(who_deploys, update_frontend_flag=True):
    owners, numConfirm = params_msw()

    print("Deploying MultiSigWallet contract...")
    multiSigWallet = MultiSigWallet.deploy(
        owners, numConfirm, {"from": who_deploys})
    print(f"MultiSigWallet contract deployed at {multiSigWallet}")

    print("Deploying TestContract contract...")
    testContract = TestContract.deploy({"from": who_deploys})
    print(f"TestContract deployed at {testContract}")
    if update_frontend_flag:
        update_front_end()
    return multiSigWallet, testContract


def fund_contract(_multiSigWallet, howMuch, who_funds):
    print(f"Funding MultiSigWallet with {howMuch} from {who_funds}...")
    who_funds.transfer(_multiSigWallet.address, howMuch)
    print("Funded")


def create_and_confirm_tx(multiSigWallet, againstContract, random_value, who_create):
    print(f"Create a transaction from {who_create}...")
    transaction_value = Web3.toWei(1, "gwei")
    param1 = random_value
    param2 = random.randint(0, 2000)

    # This is how we can manually encode the function call and the parameters
    # func_signature = Web3.keccak(text="callMe(uint256,uint256)")[:4].hex()
    # params_encoded = eth_abi.encode_abi(
    #     ["uint256", "uint256"], [var1, var2]).hex()
    # calldata_encoded = func_signature+params_encoded
    # print(calldata_encoded)
    # solidity_encoded = againstContract.getData(var1, var2)
    # print(solidity_encoded)
    # assert solidity_encoded == calldata_encoded

    # This is how we encode using contract.method.encode_input
    #solidity_encoded = againstContract.getData(var1, var2)
    calldata_encoded = againstContract.callMe.encode_input(param1, param2)
    #print(f"calldata ={calldata_encoded}")
    #assert solidity_encoded == calldata_encoded

    # in the case we want to test the encoding of string parameter
    # encoding done manually
    # func_signature = Web3.keccak(text="callMeString(string)")[:4].hex()
    # paramString1 = "test"
    # params_encoded = eth_abi.encode_abi(["string"], [paramString1]).hex()
    # calldata_encoded = func_signature+params_encoded
    # print(calldata_encoded)

    # print(solidity_encoded)
    # solidity_encoded = againstContract.getDataString(paramString1)
    # or encoding done with contract.method.encode_input
    # calldata_encoded = againstContract.callMeString.encode_input(paramString1)
    # assert solidity_encoded == calldata_encoded

    tx = multiSigWallet.submitTransaction(
        againstContract.address, transaction_value, calldata_encoded, {"from": who_create})
    tx.wait(1)
    owners, numConfirm = params_msw()
    for i in range(0, numConfirm):
        print(f"Confirming transaction {tx.txid} from {owners[i]}...")
        tx_confirm = multiSigWallet.confirmTransaction(0, {"from": owners[i]})
        tx_confirm.wait(1)
        print(f"Confirmed transaction {tx.txid}")
    return multiSigWallet.getTransactionCount()-1


def execute_tx(tx_index, wallet, who_executes):
    print("-------------------------------")
    print(f"Executing transaction {tx_index} from {who_executes}...")
    _to, _value, _data, _executed, _numConfirmations = wallet.getTransaction(
        tx_index, {"from": who_executes})
    print(f" - to:{_to}")
    print(f" - value:{_value/DECIMALS} ether")
    print(f" - data:{_data}")
    calldata = TestContract[-1].callMe.decode_input(_data)
    # #calldata = TestContract[-1].callMeString.decode_input(_data)
    print(f" - data decoded:{calldata}")
    print(f" - executed:{_executed}")
    print(f" - numConfirmations:{_numConfirmations}")
    print("-------------------------------")
    tx = wallet.executeTransaction(tx_index, {"from": who_executes})
    tx.wait(1)
    print(f"Transaction {tx_index} executed, the return is {tx.return_value}")


def print_values(msw, testC):
    print(f"Now, TestContract.i is {testC.i()}")
    print(f"Now, TestContract.balance is {testC.balance()/DECIMALS} ether")
    print(f"Now, MultiSigWallet.balance is {msw.balance()/DECIMALS} ether")
    print(
        f"Now, accounts[0].balance is {accounts[0].balance()/DECIMALS} ether")
