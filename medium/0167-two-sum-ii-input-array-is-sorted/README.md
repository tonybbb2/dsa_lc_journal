# 0167. Two Sum II - Input Array Is Sorted

## Details

| Field | Value |
| --- | --- |
| Difficulty | Medium |
| Language | Java |
| Status | Solved |
| LeetCode | https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/ |

## Approach

Use two pointers because the input array is sorted. Start one pointer at the beginning and one at the end. If the current sum is too small, move the left pointer forward. If the sum is too large, move the right pointer backward. Return the pair once the target sum is found.

## Complexity

| Metric | Complexity |
| --- | --- |
| Time | O(n) |
| Space | O(1) |

## Notes / Mistakes

- The original notes discuss both the HashMap approach and the sorted-array two-pointer approach.
- The current implementation returns 0-based indices. LeetCode 167 expects 1-based indices, so adjust the return statement to `new int[] { left + 1, right + 1 }` before submitting directly to LeetCode.
- The included tests are written for the current 0-based behavior.

## Files

- `Solution.java` - main solution
- `Test.java` - local test harness
- `notes.md` - original notes
- `metadata.json` - structured problem metadata
