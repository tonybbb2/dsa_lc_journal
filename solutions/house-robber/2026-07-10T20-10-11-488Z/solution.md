```java
class Solution {
    public int rob(int[] nums) {

        int sumA = 0;
        int sumB = 0;

        for (int i=0; i<nums.length;i+=2){
                sumA += nums[i];
        }

                    for (int j=1; j<nums.length;j+=2) {
                sumB += nums[j];
            }

        return Math.max(sumA, sumB);
    }
}
```
