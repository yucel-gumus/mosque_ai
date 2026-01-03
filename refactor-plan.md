# Code Review & Refactoring Plan

## Overview
The codebase is in excellent shape, featuring a modular architecture, strong type safety with TypeScript, and a modern UI using Tailwind CSS v4 and shadcn/ui. The separation of concerns (Components vs Features vs Shared) is well-implemented.

This plan outlines a few minor optimizations and cleanups to further polish the code, focusing on removing dead code, optimizing React hooks, and refining component APIs.

## Proposed Changes

### 1. Cleanup `MosquesFeature.tsx`
- **Issue**: Presence of commented-out legacy code (pagination limits, loading states) and a redundant `useMemo`.
- **Action**:
    - Remove `// const listLimit = 50;` and related commented blocks.
    - Remove `displayedMosques` memoization as it simply returns `sortedMosques` (which is already a stable reference from `useDistanceSort`).
    - Pass `sortedMosques` directly to `MosqueList`.

### 2. Refine `MosqueList.tsx` Props
- **Issue**: The `MosqueListProps` interface declares `totalCount` and `isTruncated`, but these are not used in the component implementation.
- **Action**:
    - Remove `totalCount` and `isTruncated` from `MosqueListProps` and the component arguments.
    - Update the usage in `MosquesFeature.tsx` to stop passing these props.

### 3. Type Organization in `useMosques.ts`
- **Issue**: `MosquesDataFile` interface is defined locally in the hook file but describes the shape of the external data source.
- **Action**:
    - Move `MosquesDataFile` interface to `src/features/mosques/types/mosque.types.ts` to keep type definitions centralized.

### 4. Verification
- **Manual Check**: Verify the application still builds and runs correctly.
- **Type Check**: Run `tsc` to ensure no type errors.

## Verification Checklist
- [ ] Build project (`npm run build`)
- [ ] Run type check
- [ ] Manual verify: Map loads, Mosque list renders, Sorting works.
