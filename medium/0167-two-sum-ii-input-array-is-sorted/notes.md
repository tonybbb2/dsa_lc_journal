# Two Sum Notes

## Problem Analysis
- Find two indices in an array that add up to a target value
- Each input has exactly one solution
- Cannot use the same element twice
- Return indices in any order (but typically sorted)

## Solution Approach: HashMap
- Use a HashMap to store value -> index mapping
- For each element, check if (target - current) exists in map
- If found, return [map.get(complement), current_index]
- Otherwise, add current value and index to map
- Time: O(n), Space: O(n)

## Alternative: Two Pointers (if array is sorted)
- Sort the array and track original indices
- Use two pointers from start and end
- Move pointers based on sum comparison
- Time: O(n log n) due to sorting, Space: O(n) for index tracking

## Edge Cases
- Negative numbers
- Duplicate values (but problem guarantees unique solution)
- Large array size (up to 10^4)

## LeetCode Notes
- This is a classic problem
- HashMap solution is preferred for unsorted arrays
- Return 0-based indices