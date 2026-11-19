# Assignment 1
Module name: **Felicia_steamModule.js**

Industry: **Entertainment & Digital Media**

## Setup
1. Ensure Node.js is installed on your computer
2. Download and place Felicia_steamModule into your project directory
3. Create a new file (`app.js`) in same folder and import module using `require()`:
```
const steamModule = require('./Felicia_steamModule.js');
```
4. Call the function below and run the file in your terminal:
```
node app.js
```

## Functions & How to use
### 1. searchSteamDeals(genre, maxPrice, discounted)
Searches Steam store catalog by genre, maximum price(SGD), and discounts.
- Parameters:
    - `genre` (string): Game genre
    - `maxPrice` (number): Maximum discounted price in SGD
    - `discounted` (boolean): Filter by discounts (if `true`, only returns games currently on discount)

```
console.log(steamModule.searchSteamDeals("RPG",50.00,true));
```
**Output**
```
{
    found: true,
    results: [
        {
            gameId: 'F8765F',
            title: 'Final Fantasy XV Windows Edition',
            genre: 'RPG',
            price: 69.9,
            discountPercent: 70
        }
    ]
}
```

### 2. toggleSteamWishlist(userId, gameId, priorityRank)
Toggles game on a user's Steam Wishlist. Checks user's library first (`purchases`) first so they cannot wishlist a game they already own. If the game is not on their wishlist, it adds it with a priority rank. If toggled again when already wishlisted, it removes the game.
- Parameters:
    - `userId` (string): Steam user Id
    - `gameId` (string): Game Id
    - `priorityRank` (number): Priority rank on user's wishlist

```
console.log(steamModule.toggleSteamWishlist("feldown","F8765F",2));
console.log(steamModule.toggleSteamWishlist("feldown","H4321L"));
```
**Output**
```
Added Final Fantasy XV Windows Edition to feldown's Steam Wishlist at Priority #2.
Removed Hogwarts Legacy from feldown's Steam wishlist.
```

### 3. calculateDynamicBundle(userId, bundleName, bundleGameIds, bundleDiscountPercent)
Checks user's library(`purchases`), excludes any games in bundle that user already owns, and applies extra `bundleDiscountPercent` (defaults to 10%) to remaining unowned games.
- Parameters:
    - `userId` (string): Steam user Id
    - `bundleName` (string): Name of bundle
    - `GameIds` (array of strings): Array of Game Ids in bundle
    - `bundleDiscountPercent` (number): Extra bundle discount percentage

```
console.log(steamModule.calculateDynamicBundle("feldown","Co-op & Party Bundle", ["R1234V","O5678C","M0987O"], 15));
```
**Output**
```
{
    bundleName: 'Co-op & Party Bundle',
    excludeOwnedGames: ['RV There Yet'],
    remainingGamesToBuy: ['Overcooked! 2, 'Moving Out'],
    bundleDiscount: '15%',
    finalBundlePrice: 'S$13.31
}
```

### 4. processSteamRefundRequest(purchaseId, reason)
Evaluates refund request. A purchased game is only eligible for full refund if played **less than 120 minutes (2hours) AND** purchased **within last 14 days**
- Parameters:
    - `purchaseId` (string): Purchase Id
    - `reason` (string): User's reason for requesting a refund

```
console.log(steamModule.processSteamRefundRequest("P5678","Game Crashes on startup"));
console.log(steamModule.processSteamRefundRequest("P1234","Framerate drops on my laptop"));
```
**Output**
```
{
    Refund Approved for P5678 (Game crashes on startup): $9.86 refunded to ruibena's Steam Wallet.
    Refund Rejected for P1234: Playtime (164 mins) exceeds Steam's 120 minute limit.
}
```

### 5. giftGameToFriend(senderId, recipientId, gameId, giftMessage)
Sends a digital game gift from one Steam user to a friend. Checks recipient's library first to prevent gifting a game that the recipient already own, then adds new gift purchase record.
- Parameters:
    - `senderId` (string): Steam user Id
    - `recipientId` (string): Recipient friend's Steam user Id
    - `gameId` (string): Game Id
    - `recipientId` (string): Personalised gift message

```
console.log(steamModule.giftGameToFriend("feldown","ruibena", "M0987O","HAPPY BIRTHDAYYYYY RUI^^"));
```
**Output**
```
{
    Gift Sent (P1003): feldown gifted Moving Out (S$5.80) to ruibena! Message: "HAPPY BIRTHDAYYYYY RUI^^"
}
```

# References
Provide the references that you have used to support your assignment. 

Web Application Reference: https://store.steampowered.com/ 
- Steam Refund Policy (2-Hour Playtime/14-Day Window): https://store.steampowered.com/steam_refunds/
- Steam Dynamic Bundles: https://partner.steamgames.com/doc/store/application/bundles