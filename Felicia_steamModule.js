// steam store games
let games = [
    {
        gameId: "R1234V",
        title: "RV There Yet?",
        genre: "Adventure",
        price: 8.50,
        discountPercent: 0
    },
    {
        gameId: "O5678C",
        title: "Overcooked! 2",
        genre: "Action",
        price: 29.00,
        discountPercent: 66
    },
    {
        gameId: "H4321L",
        title: "Hogwarts Legacy",
        genre: "RPG",
        price: 79.90,
        discountPercent: 0
    },
    {
        gameId: "F8765F",
        title: "Final Fantasy XV Windows Edition",
        genre: "RPG",
        price: 69.90,
        discountPercent: 70
    },
    {
        gameId: "M0987O",
        title: "Moving Out",
        genre: "Indie",
        price: 29.00,
        discountPercent: 80
    },
];

// user purchase & playtime records
let purchases = [
    {
        purchaseId: "P1234",
        userId: "feldown",
        gameId: "R1234V",
        pricePaid: 8.50,
        daysOwned: 5,
        playtimeMinutes: 164,
        refunded: false
    },
    {
        purchaseId: "P5678",
        userId: "ruibena",
        gameId: "O5678C",
        pricePaid: 9.86,
        daysOwned: 3,
        playtimeMinutes: 24,
        refunded:false
    },
];

// user wishlist records
let wishlists = [
    {
        userId: "feldown",
        gameId: "H4321L",
        priorityRank: 1
    },
    {
        userId: "ruibena",
        gameId: "M0987O",
        priorityRank: 1
    }
]

module.exports = {
    // 1. Search games on Steam Store by genre, max price, and discounts
    searchSteamDeals(genre, maxPrice, discounted) {
        let results = games.filter(game => {
            let salePrice = game.price * (1-game.discountPercent/100);
            let sameGenre = genre? game.genre.toLowerCase() == genre.toLowerCase():true;
            let withinPrice = maxPrice ? salePrice <= maxPrice : true;
            let discountMatch = discounted ? game.discountPercent > 0 : true;

            return sameGenre && withinPrice && discountMatch;
        });

        if (results.length > 0) {
            return {found: true, results: results};
        } else {
            return {found: false, message: `No matching Steam games found.`};
        }
    },

    // 2. Toggle a game on user's Steam wishlist (adds to end of list or custom rank, removes if already wishlisted)
    toggleSteamWishlist(userId, gameId, priorityRank) {
        let game = games.find(g => g.gameId == gameId);
        if (!game) {
            return `Unable to find game ${gameId}.`;
        }

        let alreadyOwned = purchases.find(
            p => p.userId == userId && p.gameId == gameId && p.refunded == false
        );
        if (alreadyOwned) {
            return `${userId} already owns ${game.title} in their Steam Library.`;
        }

        let index = wishlists.findIndex(w => w.userId == userId && w.gameId == gameId);
        if (index != -1){
            wishlists.splice(index, 1);
            return `Removed ${game.title} from ${userId}'s Steam wishlist.`;
        } else {
            let rank = priorityRank || (wishlists.length + 1);
            wishlists.push({userId: userId, gameId: gameId, priorityRank: rank});
            return `Added ${game.title} to ${userId}'s Steam Wishlist at Priority #${rank}.`;
        }
    },

    // 3. Calculate Steam Dynamic bundle price (excludes owned games & applies bundle discount %)
    calculateDynamicBundle(userId, bundleName, bundleGameIds, bundleDiscountPercent){
        let excludeOwnedGames = [];
        let gamesToBuy = [];
        let subtotal = 0;

        for (let i = 0; i < bundleGameIds.length; i++){
            let game = games.find(g => g.gameId == bundleGameIds[i]);
            if (game) {
                let alreadyOwned = purchases.find(
                    p => p.userId == userId && p.gameId == game.gameId && p.refunded == false
                );
                if (alreadyOwned) {
                    excludeOwnedGames.push(game.title);
                } else{
                    let salePrice = game.price* (1- game.discountPercent/100);
                    gamesToBuy.push(game.title);
                    subtotal += salePrice;
                }
            }
        } 
    
        if (gamesToBuy.length == 0){
            return `${userId} already owns all games in '${bundleName}'!`;
        }

        // (defaults to 10% discount if not specified)
        let bundleDisc = bundleDiscountPercent || 10;
        let finalBundlePrice = subtotal * (1-bundleDisc/100);

        return{
            bundleName:bundleName,
            excludeOwnedGames: excludeOwnedGames,
            remainingGamesToBuy: gamesToBuy,
            bundleDiscount: bundleDisc+`%`,
            finalBundlePrice: `S$`+finalBundlePrice.toFixed(2)
        };
    },

    // 4. Process Steam refund request (approves only if playtime < 120 mins & daysOwned <= 14 days)
    processSteamRefundRequest(purchaseId, reason){
        let record = purchases.find(p => p.purchaseId == purchaseId);
        if (!record){
            return `Purchase record not found: ${purchaseId}`;
        }
        if (record.refunded == true){
            return `Purchase ${purchaseId} has already been refunded.`;
        }
        
        if (record.playtimeMinutes >=120){
            return `Refund Rejected for ${purchaseId}: Playtime (${record.playtimeMinutes} mins) exceeds Steam's 120 minute limit.`
        }

        if (record.daysOwned >14){
            return `Refund Rejected for ${purchaseId}: Purchased ${record.daysOwned} days ago, exceeding Steam's 14-day refund window.`
        }

        record.refunded = true;
        return `Refund Approved for ${purchaseId} (${reason}): S$${record.pricePaid.toFixed(2)} refunded to ${record.userId}'s Steam Wallet.`
    },

    // 5. Send a digital game gift to a friend while preventing duplicate purchases if already owned it
    giftGameToFriend(senderId, recipientId, gameId, giftMessage){
        let game = games.find(g => g.gameId == gameId);
        if(!game){
            return `Unable to find game ${gameId} to gift.`;
        }

        let alreadyOwned = purchases.find(p => p.userId == recipientId && p.gameId == gameId && p.refunded == false);
        if (alreadyOwned){
            return `Gift Failed: ${recipientId} already owns ${game.title} in their Steam Library.`
        }

        let salePrice = Number((game.price*(1-game.discountPercent/100)).toFixed(2));
        let newPurchaseId = `P`+ (1000+ purchases.length +1);

        purchases.push({
            purchaseId: newPurchaseId,
            userId: recipientId,
            gameId: gameId,
            pricePaid: salePrice,
            daysOwned: 0,
            playtimeMinutes: 0,
            refunded: false
        });

        return `Gift Sent (${newPurchaseId}): ${senderId} gifted ${game.title} (S$${salePrice.toFixed(2)}) to ${recipientId}! Message: "${giftMessage}`;
    },
}