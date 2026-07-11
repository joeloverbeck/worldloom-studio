# Good and Bad Tests

## Good Tests

**Integration-style**: Test through real interfaces, not mocks of internal parts.

```typescript
// GOOD: Tests observable behavior
test("user can checkout with valid cart", async () => {
  const cart = createCart();
  cart.add(product);
  const result = await checkout(cart, paymentMethod);
  expect(result.status).toBe("confirmed");
});
```

Characteristics:

- Tests behavior users/callers care about
- Uses public API only
- Survives internal refactors
- Describes WHAT, not HOW
- One behavior contract per test; multiple assertions are fine when they jointly prove that contract and each expected value comes from the spec or a worked example

**Type-safe public-contract fixtures**: Objects passed across a public API, component prop, route, or serialized DTO boundary must be checked against that boundary's public type. Prefer an imported public type, a typed fixture builder, or `satisfies`; do not use `as any` to make an incomplete boundary fixture compile. If intentionally untyped external input is part of the behavior under test, validate it through the public runtime parser and assert the required contract shape before using it as downstream setup.

```typescript
import type { CheckoutResponse } from "@app/contracts";

const response = {
  status: "confirmed",
  orderId: "order-42",
  provenance: { actor: "alice", timestamp: "2026-07-11T09:00:00Z", flowStep: "checkout" }
} satisfies CheckoutResponse;

render(<OrderSummary initialResponse={response} />);
```

An unavoidable type escape hatch must be local, explain why the public type cannot be used, and pair the cast with an explicit assertion or parser result that proves the full boundary contract. A broad `as any` around the fixture or rendered prop is not contract evidence.

**Static contract checks**: Use these only when the spec names a source-level contract, such as a required route string or a forbidden legacy import. Pair them with public-interface coverage when behavior is user-visible. Do not use source-file string checks merely to prove browser-visible UI text, controls, or flow behavior; use a public UI/rendered DOM test or evidence-only browser smoke unless the spec names the source contract.

```typescript
import { readFileSync } from "node:fs";

// ACCEPTABLE EXCEPTION: The spec forbids calling the legacy endpoint.
test("prompt-out browser surface does not call the legacy creation skip route", () => {
  const source = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");
  expect(source).not.toContain("/api/flows/creation/skip");
});
```

## Bad Tests

**Implementation-detail tests**: Coupled to internal structure.

```typescript
// BAD: Tests implementation details
test("checkout calls paymentService.process", async () => {
  const mockPayment = jest.mock(paymentService);
  await checkout(cart, payment);
  expect(mockPayment.process).toHaveBeenCalledWith(cart.total);
});
```

Red flags:

- Mocking internal collaborators
- Testing private methods
- Asserting on call counts/order
- Test breaks when refactoring without behavior change
- Test name describes HOW not WHAT
- Verifying through external means instead of interface

```typescript
// BAD: Bypasses interface to verify
test("createUser saves to database", async () => {
  await createUser({ name: "Alice" });
  const row = await db.query("SELECT * FROM users WHERE name = ?", ["Alice"]);
  expect(row).toBeDefined();
});

// GOOD: Verifies through interface
test("createUser makes user retrievable", async () => {
  const user = await createUser({ name: "Alice" });
  const retrieved = await getUser(user.id);
  expect(retrieved.name).toBe("Alice");
});
```

**Tautological tests**: Expected value restates the implementation, so the test passes by construction.

```typescript
// BAD: Expected value is recomputed the way the code computes it
test("calculateTotal sums line items", () => {
  const items = [{ price: 10 }, { price: 5 }];
  const expected = items.reduce((sum, i) => sum + i.price, 0);
  expect(calculateTotal(items)).toBe(expected);
});

// GOOD: Expected value is an independent, known literal
test("calculateTotal sums line items", () => {
  expect(calculateTotal([{ price: 10 }, { price: 5 }])).toBe(15);
});
```
