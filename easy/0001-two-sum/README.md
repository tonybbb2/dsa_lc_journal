# 0001. Two Sum

## Details

| Field | Value |
| --- | --- |
| Difficulty | Easy |
| Language | Java |
| Status | Solved |
| LeetCode | https://leetcode.com/problems/two-sum/ |

## Approach

Use a `HashMap` to store each value and its index while scanning the array once. For each number, compute the complement needed to reach the target. If the complement already exists in the map, return the stored index and the current index.

## Complexity

| Metric | Complexity |
| --- | --- |
| Time | O(n) |
| Space | O(n) |

## Notes / Mistakes

- Original notes file was present but mostly empty.
- The included tests cover duplicates, negative values, and different index positions.
- The custom examples use 0-based indices, which matches LeetCode problem 1.

## Files

- `Solution.java` - main solution
- `Test.java` - local test harness
- `notes.md` - original notes
- `metadata.json` - structured problem metadata
