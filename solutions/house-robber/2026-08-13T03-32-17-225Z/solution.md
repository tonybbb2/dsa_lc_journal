```java
class Solution {
    public int rob(int[] nums) {
        if (nums.length == 1) {
            return nums[0];
        }

        int[] dp = new int[nums.length];

        // base case
        dp[0] = nums[0];
        dp[1] = Math.max(nums[0], nums[1]);

        for (int i=2; i<nums.length;i++) {
            int current = dp[i-1]; // dp[1] from base case
            int nextRob = nums[i] + dp[i-2]; // dp[0] from base case + nums[2]

            dp[i] = Math.max(current, nextRob); //dp[2]
        }

        return dp[nums.length - 1];
    }
}
```
