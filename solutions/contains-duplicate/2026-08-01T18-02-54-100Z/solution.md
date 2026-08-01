```java
class Solution {
    public boolean containsDuplicate(int[] nums) {
        HashSet<Integer> hashSet = new HashSet<Integer>();
        boolean result = false;

        for (int i=0; i<nums.length; i++) {
            hashSet.add(nums[i]);
        }

        int size = hashSet.size();

        if (size != nums.length) {
            result = true;
        }
        return result;
    }
}
```
