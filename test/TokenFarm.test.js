const DappToken = artifacts.require('DappToken')
const DaiToken = artifacts.require('DaiToken')
const TokenFarm = artifacts.require('TokenFarm')

require('chai')
    .use(require('chai-as-promised'))
    .should()

function tokens(n) {
  return web3.utils.toWei(n, 'ether')
}

contract('TokenFarm', ([owner, investor]) => {
  let daiToken, dappToken, tokenFarm

  before(async () => {
    //Load contracts
    daiToken = await DaiToken.new()
    dappToken = await DappToken.new()
    tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address)

    //Transfer all Dapp tokens to farm (1 milion)
    await dappToken.transfer(tokenFarm.address, tokens('1000000'))

    // Send tokens to investor
    await daiToken.transfer(investor, tokens('100'), {from: owner })
  })

    describe('Mock DAI deployment', async () => {
        it('has a name', async () => {
            const name = await daiToken.name()
            assert.equal(name, 'Mock DAI Token')
        })
    })

    describe('Dapp Token deployment', async () => {
        it('has a name', async () => {
            const name = await dappToken.name()
            assert.equal(name, 'DApp Token')
        })
    })

    describe('Token Farm deployment', async () => {
        it('has a name', async () => {
            const name = await tokenFarm.name()
            assert.equal(name, 'Dapp Token Farm')
        })
        it('contract has tokens', async () => {
          let balance = await dappToken.balanceOf(tokenFarm.address)
          assert.equal(balance.toString(), tokens('1000000'))
        })
    })
    describe('Farming tokens', async () => {
      it('rewards investors for staking mDai tokens', async () => {
        let result

        //Check investor balance before staking
        result = await daiToken.balanceOf(investor)
        assert.equal(result.toString(), tokens('100'),
            'Investor Mock DAI wallet balance correct before staking')

      // Stake Mock DAI Tokens
      await daiToken.approve(tokenFarm.address, tokens('100'), {from: investor})
      await tokenFarm.stakeTokens(tokens('100'), {from: investor})

      //Check staking result
      result = await daiToken.balanceOf(investor)
      assert.equal(result.toString(), tokens('0'),
          'Investor Mock DAI wallet balance correct before staking')

      result = await daiToken.balanceOf(tokenFarm.address)
      assert.equal(result.toString(), tokens('100'),
            'Token Farm Mock DAI balance correct after staking')
      })
    })

})
