# AI Radar — Implementation Rules

## 1. Source of truth

If there is any conflict between implementation and product documentation, follow the product documentation.

Do not make product changes implicitly through code refactors.

## 2. Change discipline

Every meaningful change should satisfy all of the following:
- it preserves documented product behavior
- it reduces ambiguity or technical debt
- it keeps future agent work easier, not harder
- it does not silently alter taxonomy or navigation

## 3. Auth and access rules

- Password Gate and Supabase Auth are distinct responsibilities
- do not collapse them into one mechanism
- protect user-bound features appropriately
- avoid leaking auth assumptions into presentational components

## 4. Tab integrity rules

Treat each tab as a real product surface:
- Daily Brief
- Latest News
- Community
- Use Cases
- Saved

Rules:
- Daily Brief must remain more curated than Latest News
- Use Cases must keep its applied / practical framing
- Saved must remain user-specific
- Settings should not be implemented beyond placeholder state unless explicitly requested

## 5. Data rules

- normalize external or ingested data before broad UI usage
- deduplicate close duplicates where appropriate
- maintain explicit support for grouping by people and by companies
- avoid encoding business logic in JSX/UI templates
- prefer typed contracts and mapper functions

## 6. UI rules

- preserve editorial hierarchy
- prefer semantic tokens over scattered hex values
- keep corners sharp or minimally rounded
- avoid overdesigned dashboards that obscure reading and scanning
- loading, empty, and error states must be intentional

## 7. Component rules

Prefer:
- small feature-owned components
- shared primitives only when truly reusable
- container/presenter separation when complexity increases

Avoid:
- enormous components with fetching, filtering, rendering, and auth mixed together
- generic card abstractions that erase content differences
- prop interfaces that become informal data schemas

## 8. State management rules

- keep local UI state local
- centralize only durable cross-route or cross-feature state
- avoid premature complexity
- derived state should stay derived, not duplicated

## 9. Refactor rules

When refactoring:
1. identify what product behavior is being protected
2. isolate structural debt
3. move logic without changing behavior
4. only then improve contracts or composition

Do not combine architectural rewrites with product reinterpretation.

## 10. Definition of done

A change is done only when:
- product invariants still hold
- affected flows still work coherently
- naming remains aligned with product language
- implementation is easier for a future coding agent to understand