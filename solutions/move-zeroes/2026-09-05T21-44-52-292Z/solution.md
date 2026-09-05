```java
class Solution {
    public void moveZeroes(int[] nums) {
        int containsZeroes = 0;

        for (int i = 0; i < nums.length; i++) {
            if (nums[i] != 0) {
                nums[containsZeroes] = nums[i];
                containsZeroes++;
            }
        }

        while (containsZeroes < nums.length) {
            nums[containsZeroes] = 0;
            containsZeroes++;
        }
    }
}
```
