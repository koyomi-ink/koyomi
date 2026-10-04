tests here should look for things like mocking supabase instances to verify that a client trying to update `quoted_price` gets blocked by the `enforce_client_tampering_protection` postgres trigger

naming: [module].test.ts (e.g., tests/integration/onboarding/slug-claim.test.ts)
