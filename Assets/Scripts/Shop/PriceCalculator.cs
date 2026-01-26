using System;
using UnityEngine;
using IronFrontier.Data;

namespace IronFrontier.Shop
{
    /// <summary>
    /// Result of a price calculation.
    /// </summary>
    public struct PriceResult
    {
        /// <summary>Base price before modifiers.</summary>
        public int BasePrice;

        /// <summary>Final price after all modifiers.</summary>
        public int FinalPrice;

        /// <summary>Reputation modifier applied.</summary>
        public float ReputationModifier;

        /// <summary>Supply/demand modifier applied.</summary>
        public float SupplyDemandModifier;

        /// <summary>Haggle modifier applied.</summary>
        public float HaggleModifier;

        /// <summary>Shop markup/markdown applied.</summary>
        public float ShopModifier;

        /// <summary>Item-specific price modifier.</summary>
        public float ItemModifier;

        /// <summary>Total discount percentage (0-1).</summary>
        public float TotalDiscount => 1f - ((float)FinalPrice / BasePrice);

        /// <summary>Whether the player is getting a good deal.</summary>
        public bool IsGoodDeal => TotalDiscount > 0.15f;

        /// <summary>
        /// Format price for display.
        /// </summary>
        public string FormatPrice() => $"${FinalPrice:N0}";

        /// <summary>
        /// Format with original price if discounted.
        /// </summary>
        public string FormatWithDiscount()
        {
            if (FinalPrice == BasePrice)
                return FormatPrice();

            return $"${FinalPrice:N0} (was ${BasePrice:N0})";
        }
    }

    /// <summary>
    /// Result of a haggle attempt.
    /// </summary>
    public struct HaggleResult
    {
        /// <summary>Whether the haggle was successful.</summary>
        public bool Success;

        /// <summary>The new price after haggling.</summary>
        public int NewPrice;

        /// <summary>Discount achieved (0-1).</summary>
        public float Discount;

        /// <summary>Shopkeeper's response message.</summary>
        public string Response;

        /// <summary>Whether this was the final offer.</summary>
        public bool IsFinalOffer;
    }

    /// <summary>
    /// Handles all price calculations for shop transactions.
    /// </summary>
    /// <remarks>
    /// Ported from TypeScript ShopController.ts pricing logic.
    /// Supports reputation, supply/demand, and haggling systems.
    /// </remarks>
    public static class PriceCalculator
    {
        #region Constants

        /// <summary>Base reputation score for neutral standing.</summary>
        public const int NEUTRAL_REPUTATION = 50;

        /// <summary>Maximum reputation score.</summary>
        public const int MAX_REPUTATION = 100;

        /// <summary>Minimum reputation score.</summary>
        public const int MIN_REPUTATION = 0;

        /// <summary>Base chance for haggle success.</summary>
        public const float BASE_HAGGLE_CHANCE = 0.5f;

        /// <summary>Maximum consecutive haggle attempts.</summary>
        public const int MAX_HAGGLE_ATTEMPTS = 3;

        /// <summary>Penalty per failed haggle attempt.</summary>
        public const float HAGGLE_FAILURE_PENALTY = 0.1f;

        #endregion

        #region Buy Price Calculation

        /// <summary>
        /// Calculate the buy price for an item (player buying from shop).
        /// </summary>
        /// <param name="item">The item being purchased.</param>
        /// <param name="shopData">The shop selling the item.</param>
        /// <param name="stockEntry">The stock entry for the item.</param>
        /// <param name="playerReputation">Player's reputation (0-100).</param>
        /// <param name="currentStock">Current stock level.</param>
        /// <param name="maxStock">Maximum stock level.</param>
        /// <param name="haggleDiscount">Discount from successful haggling (0-1).</param>
        /// <returns>Price calculation result.</returns>
        public static PriceResult CalculateBuyPrice(
            ItemData item,
            ShopData shopData,
            ShopStockEntry stockEntry,
            int playerReputation = NEUTRAL_REPUTATION,
            int currentStock = -1,
            int maxStock = -1,
            float haggleDiscount = 0f)
        {
            if (item == null)
            {
                return new PriceResult { BasePrice = 0, FinalPrice = 0 };
            }

            int basePrice = item.value;
            float shopModifier = shopData?.buyPriceMultiplier ?? 1.0f;
            float itemModifier = stockEntry?.priceModifier ?? 1.0f;
            float reputationModifier = 1.0f;
            float supplyDemandModifier = 1.0f;
            float haggleModifier = 1.0f - haggleDiscount;

            // Apply reputation discount
            if (shopData != null && shopData.reputationAffectsPrices)
            {
                reputationModifier = CalculateReputationModifier(
                    playerReputation,
                    shopData.maxReputationDiscount,
                    true // buying
                );
            }

            // Apply supply/demand modifier
            if (currentStock >= 0 && maxStock > 0)
            {
                supplyDemandModifier = CalculateSupplyDemandModifier(
                    currentStock,
                    maxStock,
                    true // buying
                );
            }

            // Calculate final price
            float finalMultiplier = shopModifier * itemModifier * reputationModifier *
                                    supplyDemandModifier * haggleModifier;
            int finalPrice = Mathf.Max(1, Mathf.RoundToInt(basePrice * finalMultiplier));

            return new PriceResult
            {
                BasePrice = basePrice,
                FinalPrice = finalPrice,
                ReputationModifier = reputationModifier,
                SupplyDemandModifier = supplyDemandModifier,
                HaggleModifier = haggleModifier,
                ShopModifier = shopModifier,
                ItemModifier = itemModifier
            };
        }

        #endregion

        #region Sell Price Calculation

        /// <summary>
        /// Calculate the sell price for an item (player selling to shop).
        /// </summary>
        /// <param name="item">The item being sold.</param>
        /// <param name="shopData">The shop buying the item.</param>
        /// <param name="playerReputation">Player's reputation (0-100).</param>
        /// <param name="itemCondition">Item condition (0-1, 1 = perfect).</param>
        /// <param name="isStolen">Whether the item is stolen.</param>
        /// <param name="haggleBonus">Bonus from successful haggling (0-1).</param>
        /// <returns>Price calculation result.</returns>
        public static PriceResult CalculateSellPrice(
            ItemData item,
            ShopData shopData,
            int playerReputation = NEUTRAL_REPUTATION,
            float itemCondition = 1.0f,
            bool isStolen = false,
            float haggleBonus = 0f)
        {
            if (item == null || !item.sellable)
            {
                return new PriceResult { BasePrice = 0, FinalPrice = 0 };
            }

            int basePrice = item.value;
            float shopModifier = shopData?.sellPriceMultiplier ?? 0.5f;
            float reputationModifier = 1.0f;
            float conditionModifier = Mathf.Clamp01(itemCondition);
            float stolenModifier = 1.0f;
            float haggleModifier = 1.0f + haggleBonus;

            // Apply reputation bonus
            if (shopData != null && shopData.reputationAffectsPrices)
            {
                reputationModifier = CalculateReputationModifier(
                    playerReputation,
                    shopData.maxReputationDiscount,
                    false // selling
                );
            }

            // Apply stolen item penalty (unless fence)
            if (isStolen && shopData != null && !shopData.IsFence)
            {
                stolenModifier = 0.25f; // 75% penalty for non-fences
            }
            else if (isStolen && shopData?.IsFence == true)
            {
                stolenModifier = 0.7f; // Fences take 30% cut
            }

            // Calculate final price
            float finalMultiplier = shopModifier * reputationModifier * conditionModifier *
                                    stolenModifier * haggleModifier;
            int finalPrice = Mathf.Max(0, Mathf.RoundToInt(basePrice * finalMultiplier));

            return new PriceResult
            {
                BasePrice = basePrice,
                FinalPrice = finalPrice,
                ReputationModifier = reputationModifier,
                SupplyDemandModifier = 1.0f,
                HaggleModifier = haggleModifier,
                ShopModifier = shopModifier,
                ItemModifier = conditionModifier * stolenModifier
            };
        }

        #endregion

        #region Reputation Modifier

        /// <summary>
        /// Calculate the reputation-based price modifier.
        /// </summary>
        /// <param name="reputation">Player's reputation (0-100).</param>
        /// <param name="maxDiscount">Maximum discount percentage.</param>
        /// <param name="isBuying">True if player is buying, false if selling.</param>
        /// <returns>Price multiplier (less than 1 = discount for buying, more than 1 = bonus for selling).</returns>
        public static float CalculateReputationModifier(
            int reputation,
            float maxDiscount,
            bool isBuying)
        {
            // Normalize reputation to -1 to 1 range (negative = bad, positive = good)
            float normalizedRep = (reputation - NEUTRAL_REPUTATION) / (float)NEUTRAL_REPUTATION;
            normalizedRep = Mathf.Clamp(normalizedRep, -1f, 1f);

            if (isBuying)
            {
                // Good reputation = discount (lower multiplier)
                // Bad reputation = markup (higher multiplier)
                float modifier = 1f - (normalizedRep * maxDiscount);
                return Mathf.Clamp(modifier, 1f - maxDiscount, 1f + maxDiscount);
            }
            else
            {
                // Good reputation = better prices (higher multiplier)
                // Bad reputation = worse prices (lower multiplier)
                float modifier = 1f + (normalizedRep * maxDiscount);
                return Mathf.Clamp(modifier, 1f - maxDiscount, 1f + maxDiscount);
            }
        }

        #endregion

        #region Supply/Demand Modifier

        /// <summary>
        /// Calculate supply/demand based price modifier.
        /// </summary>
        /// <param name="currentStock">Current stock level.</param>
        /// <param name="maxStock">Maximum stock level.</param>
        /// <param name="isBuying">True if player is buying.</param>
        /// <returns>Price multiplier.</returns>
        public static float CalculateSupplyDemandModifier(
            int currentStock,
            int maxStock,
            bool isBuying)
        {
            if (maxStock <= 0)
                return 1.0f;

            float stockRatio = (float)currentStock / maxStock;

            if (isBuying)
            {
                // Low stock = higher prices (up to 25% markup)
                // High stock = slight discount (up to 10%)
                if (stockRatio < 0.25f)
                {
                    return 1.25f; // Scarce
                }
                else if (stockRatio < 0.5f)
                {
                    return 1.1f; // Low
                }
                else if (stockRatio > 0.9f)
                {
                    return 0.9f; // Overstocked
                }
            }
            else
            {
                // Shop's demand: low stock = better sell prices
                if (stockRatio < 0.25f)
                {
                    return 1.15f; // Shop wants these
                }
                else if (stockRatio > 0.75f)
                {
                    return 0.85f; // Shop doesn't need these
                }
            }

            return 1.0f;
        }

        #endregion

        #region Haggling System

        /// <summary>
        /// Attempt to haggle on a price.
        /// </summary>
        /// <param name="currentPrice">Current asking price.</param>
        /// <param name="basePrice">Original base price.</param>
        /// <param name="shopData">Shop data for haggle limits.</param>
        /// <param name="playerCharisma">Player's charisma stat (0-100).</param>
        /// <param name="attemptNumber">Which haggle attempt this is (1-3).</param>
        /// <param name="isBuying">Whether player is buying.</param>
        /// <returns>Result of the haggle attempt.</returns>
        public static HaggleResult AttemptHaggle(
            int currentPrice,
            int basePrice,
            ShopData shopData,
            int playerCharisma,
            int attemptNumber,
            bool isBuying)
        {
            if (shopData == null || !shopData.allowHaggling)
            {
                return new HaggleResult
                {
                    Success = false,
                    NewPrice = currentPrice,
                    Discount = 0,
                    Response = "This merchant doesn't haggle.",
                    IsFinalOffer = true
                };
            }

            if (attemptNumber > MAX_HAGGLE_ATTEMPTS)
            {
                return new HaggleResult
                {
                    Success = false,
                    NewPrice = currentPrice,
                    Discount = 0,
                    Response = "Take it or leave it.",
                    IsFinalOffer = true
                };
            }

            // Calculate success chance
            float charismaBonus = playerCharisma / 200f; // 0-0.5 bonus
            float attemptPenalty = (attemptNumber - 1) * HAGGLE_FAILURE_PENALTY;
            float successChance = Mathf.Clamp01(BASE_HAGGLE_CHANCE + charismaBonus - attemptPenalty);

            bool success = UnityEngine.Random.value < successChance;

            if (!success)
            {
                string[] failResponses = attemptNumber switch
                {
                    1 => new[] {
                        "That price is fair and you know it.",
                        "I've got to make a living here.",
                        "Can't go any lower on that one."
                    },
                    2 => new[] {
                        "You're pushing your luck, friend.",
                        "That's my final offer.",
                        "I'm being more than reasonable."
                    },
                    _ => new[] {
                        "We're done haggling.",
                        "Take it or leave it.",
                        "My patience is wearing thin."
                    }
                };

                return new HaggleResult
                {
                    Success = false,
                    NewPrice = currentPrice,
                    Discount = 0,
                    Response = failResponses[UnityEngine.Random.Range(0, failResponses.Length)],
                    IsFinalOffer = attemptNumber >= MAX_HAGGLE_ATTEMPTS
                };
            }

            // Calculate discount based on attempt number
            float maxDiscount = shopData.maxHaggleDiscount;
            float discountPerAttempt = maxDiscount / MAX_HAGGLE_ATTEMPTS;
            float thisDiscount = discountPerAttempt * (0.5f + UnityEngine.Random.value * 0.5f);

            // Apply charisma bonus to discount
            thisDiscount *= (1f + charismaBonus * 0.5f);
            thisDiscount = Mathf.Min(thisDiscount, maxDiscount - (attemptNumber - 1) * discountPerAttempt * 0.3f);

            int newPrice;
            if (isBuying)
            {
                newPrice = Mathf.Max(1, Mathf.RoundToInt(currentPrice * (1f - thisDiscount)));
            }
            else
            {
                newPrice = Mathf.RoundToInt(currentPrice * (1f + thisDiscount));
            }

            float totalDiscount = isBuying
                ? 1f - ((float)newPrice / basePrice)
                : ((float)newPrice / basePrice) - 1f;

            string[] successResponses = attemptNumber switch
            {
                1 => new[] {
                    "Alright, you drive a hard bargain.",
                    "Fine, but only because I like you.",
                    "You're a shrewd one, aren't you?"
                },
                2 => new[] {
                    "You're killing me here, but okay.",
                    "My wife's going to kill me for this.",
                    "That's really my best price now."
                },
                _ => new[] {
                    "You've bled me dry. Final offer.",
                    "Any lower and I'm paying you. Done.",
                    "That's it. Take it before I change my mind."
                }
            };

            return new HaggleResult
            {
                Success = true,
                NewPrice = newPrice,
                Discount = thisDiscount,
                Response = successResponses[UnityEngine.Random.Range(0, successResponses.Length)],
                IsFinalOffer = attemptNumber >= MAX_HAGGLE_ATTEMPTS || totalDiscount >= maxDiscount * 0.9f
            };
        }

        #endregion

        #region Repair Cost Calculation

        /// <summary>
        /// Calculate the cost to repair an item.
        /// </summary>
        /// <param name="item">The item to repair.</param>
        /// <param name="currentCondition">Current condition (0-1).</param>
        /// <param name="shopData">Shop offering repairs.</param>
        /// <param name="playerReputation">Player's reputation.</param>
        /// <returns>Repair cost.</returns>
        public static int CalculateRepairCost(
            ItemData item,
            float currentCondition,
            ShopData shopData,
            int playerReputation = NEUTRAL_REPUTATION)
        {
            if (item == null || shopData == null || !shopData.offersRepairs)
                return 0;

            float damageAmount = 1f - Mathf.Clamp01(currentCondition);
            if (damageAmount <= 0)
                return 0;

            float baseCost = item.value * shopData.repairCostMultiplier * damageAmount;

            // Apply reputation discount
            float repModifier = CalculateReputationModifier(
                playerReputation,
                shopData.maxReputationDiscount,
                true
            );

            return Mathf.Max(1, Mathf.RoundToInt(baseCost * repModifier));
        }

        #endregion

        #region Bulk Pricing

        /// <summary>
        /// Calculate price for buying multiple items (with bulk discount).
        /// </summary>
        /// <param name="unitPrice">Price per unit.</param>
        /// <param name="quantity">Number of items.</param>
        /// <param name="bulkThreshold">Quantity threshold for bulk pricing.</param>
        /// <param name="bulkDiscount">Discount percentage for bulk (0-1).</param>
        /// <returns>Total price with any bulk discount applied.</returns>
        public static int CalculateBulkPrice(
            int unitPrice,
            int quantity,
            int bulkThreshold = 5,
            float bulkDiscount = 0.1f)
        {
            if (quantity < bulkThreshold)
            {
                return unitPrice * quantity;
            }

            float discount = Mathf.Min(bulkDiscount, 0.25f); // Cap at 25%
            int baseTotal = unitPrice * quantity;
            return Mathf.RoundToInt(baseTotal * (1f - discount));
        }

        #endregion
    }
}
