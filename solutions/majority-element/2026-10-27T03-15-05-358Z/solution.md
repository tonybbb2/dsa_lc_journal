```java
class Solution {
    public int majorityElement(int[] nums) {
        HashMap<Integer, Integer> map = new HashMap<>();
        HashSet<Integer> set = new HashSet<>();

        for (int i=0; i<nums.length; i++) {
            int sum = 0;
            if (!set.contains(nums[i])) {
                set.add(nums[i]);
                map.put(nums[i], 1);
            } else {
                int currentCount = map.get(nums[i]);
                map.put(nums[i], currentCount + 1);
            }
        }

        int highestValue = Collections.max(map.values());

        for (int i : map.keySet()) {
            if (map.get(i) == highestValue) {
                return i;
            }
        }

        return nums[0];

    }
}
```
