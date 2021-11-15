const WaitAndWin = artifacts.require('./WaitAndWin.sol');

contract("WaitAndWin", accounts => {
  //===========================================
  //             global variables
  //===========================================
  let waw;                                   //
  let ether;                                 //
  let rateOfChange;                          //

  let user1 = accounts[1];                   //
  let user2 = accounts[2];                   //

  before(async () => {                       //
    waw = await WaitAndWin.deployed();       //
    ether = 1 * 10 ** (18);                  //
  });                                        //
  //===========================================


  //===========================================
  //          CHECK CONTRACT PROPERTIES
  //===========================================
  it("should check contract propreties", async () => {
    //a address
    let addr = await waw.address;
    // token name
    let name = await waw.name();
    // token symbol
    let symbol = await waw.symbol();
    // rate of change
    rateOfChange = await waw.rateOfChange();

    assert.notEqual(addr, "", "contract not deployed");
    assert.equal(name, "Wait And Win", "contract name not defined");
    assert.equal(symbol, "WAW", "contract symbol not defined");
    assert.equal(Number(rateOfChange), 1000, "incorrect rate of change");
  });

  // check the deposit address
  it("should check the deposit address", async () => {
    let depositAddress = await waw.depositETHAddress();

    assert.equal(
      depositAddress, "0xC0D335A6296310895E87fcAa31466283f65f43Eb",
      "deposit addrss not found"
    );
  })

  // check some state variables
  it("should check state variables", async () => {
    // initial supply
    let initialSupply = await waw.totalSupply();

    assert.equal(
      Number(initialSupply / ether), 500000,
      "incorrect initial supply"
    );
  });
  //============================================


  //============================================
  //              REGISTER A POOL
  //============================================
  it("should register a pool", async () => {
    let poolID = "P00L - 001";
    let totalTokens = (200 / rateOfChange) * ether;
    let poolTokens = 20 * ether;

    // buy tokens to be used to open a pool
    await waw.buyToken({ from: user1, value: totalTokens });
    // open a pool
    await waw.RegisterOrJoinPool(poolID, poolTokens.toString(), { from: user1 });

    // fetch pool info from the contract
    let pool = await waw.vPools(poolID);

    //console.log("Pool:", pool);

    // check info from pool variable
    assert.ok(pool.registered, "pool not registered");
    assert.equal(pool.ID, poolID, "pool id not matched");
    assert.equal(pool.prize.toString(), poolTokens, "pool id not match");
    assert.equal(Number(pool.numberOfUsers), 1, "number of users not match");

    //===  ANOTHER USER JOIGNING THE POOL ===
    // buy tokens to be used to open a pool
    let totalTokens_2 = (100 / rateOfChange) * ether;
    await waw.buyToken({ from: user2, value: totalTokens_2 });

    // join the pool
    await waw.joinPool(poolID, poolTokens.toString(), { from: user2 });

    // update the pool
    pool = await waw.vPools(poolID);

    assert.equal(pool.prize.toString(), 2 * poolTokens, "pool id not match");
    assert.equal(Number(pool.numberOfUsers), 2, "number of users not match");
    //===========================================
  });

});


