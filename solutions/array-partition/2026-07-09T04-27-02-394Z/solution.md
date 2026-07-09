```java
class Solution {
    public int arrayPairSum(int[] nums) {
        Arrays.sort(nums);

        int maxAmount = 0;

        for (int i=0; i<nums.length;i+=2) {
            maxAmount += nums[i];
        }

        return maxAmount;
    }
}
```
