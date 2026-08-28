# Security Specification & Test Matrix

## 1. Data Invariants
- Invariant 1 (Identity Binding): A user document at `/users/{userId}` can only be created or read by `request.auth.uid == userId`.
- Invariant 2 (Ownership): Sub-resources under `/users/{userId}/...` strictly inherit ownership and require `request.auth.uid == userId`.
- Invariant 3 (Immutability): Critical identity keys like `userId` cannot be modified after document creation.
- Invariant 4 (Type & Length Constraints): Strings must obey explicit `.size()` boundaries (e.g. `<= 255` characters).
- Invariant 5 (Denial-of-Wallet Defense): Document IDs must satisfy `isValidId(id)` pattern (`^[a-zA-Z0-9_\-]+$`) and size `<= 128`.
- Invariant 6 (Default Deny): Any unmapped path or collection is denied by default.

## 2. The Dirty Dozen Payloads (Designed to Fail with PERMISSION_DENIED)
1. **Unauthenticated Read**: Reading `/users/user_123` with `auth == null`.
2. **Cross-User Impersonation Write**: User A attempting to write `/users/user_B`.
3. **Admin Escalation on Create**: User setting their own `role: "superadmin"` bypassing validation.
4. **Id Injection Attack**: Writing to path `/users/<1.5kb string>`.
5. **Ghost Field Poisoning**: Inserting unknown arbitrary field `{ ghostField: true }` on update.
6. **Subcollection Hijack**: User A creating a transaction in User B's `/users/{userB}/transactions/`.
7. **Oversized String Bomb**: Writing `description` greater than 255 characters.
8. **Invalid Enum**: Writing `paymentMethod: "bitcoin_unsupported"`.
9. **Negative Transaction Amount Tampering**: Writing non-number or illegal value.
10. **Timestamp Forgery**: Modifying immutable createdAt field.
11. **Blanket Query Scraping**: Running open `collectionGroup('transactions')` without owner filter.
12. **Anonymous Write Exploit**: Anonymous unverified session attempting destructive document wipe.
