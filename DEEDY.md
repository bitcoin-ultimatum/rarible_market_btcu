## Token

# General mint:

1. Generate id by using **generateTokenId(creatorAddress, tokenGeneralId)**. Here is example script:
https://gitlab.profitserver.in.ua/denis.ponizhan/id-gen/

2. Call mint 

    2.1 parametrs:

    ```
    ERC1155Rarible.mint(
        data,  // array
        to, // address 
        amount
    )
    ```

    2.2 example

    ```
    await token.mintAndTransfer(
        [
            tokenId, 
            tokenURI, 
            supply, // totalSupply
            creators([minter]), // array [{…}, {…}]
            [], // array [{…}, {…}]
            [zeroWord] // array of creators signatures, zeroWord in case of general mint
        ], 
        minter,
        mint, // amount to be minted
        { 
            from: minter 
        }
    )

    function creators(list) {
  	    const value = 10000 / list.length
  	    return list.map(account => ({ account, value }))
    }

    function royalties(list) {
  	    const value = 10000 / list.length
  	    return list.map(account => ({ account, value })) // value is account fee in percent 10000 = 100%
    }
    ```

    For more detailed example follow to ERC1155Rarible.test.js, there is everything you need.

# Lazy mint: performed within order matching