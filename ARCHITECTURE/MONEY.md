# Money Convention

## Current convention: integer đồng stored as JavaScript Number

All monetary values in the database (price, salePrice, totalPrice, itemsPrice,
shippingPrice, discount) are stored and transmitted as **integer Vietnamese đồng**.

```
Example: 250,000 VND  →  stored as  250000  (Number)
```

### Why this is safe today

* VND has no sub-unit (no cents). Every real price is a whole number.
* JavaScript `Number` (IEEE 754 double) has exact integer precision up to
  2^53 − 1 = 9,007,199,254,740,991, which is ~9 quadrillion đồng.
  The most expensive item we realistically store is in the low millions,
  so there is no precision loss.
* MongoDB stores these as BSON `double` on disk, which has the same 53-bit
  mantissa. Again, no precision loss for integer values in this range.

### Rules

1. **Never do arithmetic on fractional đồng.** e.g. `price * 0.9` for a 10%
   discount should be `Math.round(price * 0.9)` — but since VND prices are
   already round numbers, this virtually never occurs in practice.
2. **Never store prices as strings.** Always `Number` / BSON double.
3. **Display only**: `formatCurrency(n)` in the frontend rounds and formats for
   display. The raw stored value is always the source of truth.
4. **Shipping threshold**: computed server-side (`itemsPrice >= 500_000 ? 0 : 30_000`),
   never trusted from the client.

### If multi-currency is added in the future

Migrate `price`, `salePrice`, `totalPrice`, `itemsPrice`, `shippingPrice`, and
`discount` fields to either:

* **Mongoose `Decimal128`** — exact decimal arithmetic, stored natively in MongoDB.
* **Integer minor units** — store in the smallest currency unit (e.g. USD cents,
  JPY yen, VND đồng), add a `currency: String` field, and convert at display time.

Do **not** attempt this migration without a tested data migration script and a
rollback plan. The current `Number` representation is intentional and correct
for VND-only operation.
