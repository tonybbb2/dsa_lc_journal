# Two Sum (Unsorted Array)

Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

## Examples

### Example 1:
```
Input: nums = [11,2,15,7], target = 9
Output: [1,3]
Explanation: Because nums[1] + nums[3] == 9, we return [1, 3].
```

### Example 2:
```
Input: nums = [4,2,3], target = 6
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 6, we return [0, 1].
```

### Example 3:
```
Input: nums = [3,3], target = 6
Output: [0,1]
```

## Constraints
- `2 <= nums.length <= 10^4`
- `-10^9 <= nums[i] <= 10^9`
- `-10^9 <= target <= 10^9`
- Only one valid answer exists.
