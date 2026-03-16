class Solution {
    public int[] twoSum(int[] nums, int target) {
        int left = 0;
        int right = nums.length - 1;

        while (left < right) {
            int sum = nums[left] + nums[right];

            if (sum == target) {
                return new int[]{left + 1, right + 1};
            } else if (sum < target) {
                left++;  
            } else {
                right--; 
            }
        }

        return new int[]{};
    }

    public static void main(String[] args) {
        Solution solution = new Solution();

        // Test Case 1: nums = [1,2,3,4,5], target = 7, expected [2,5]
        int[] nums1 = {1, 2, 3, 4, 5};
        int target1 = 7;
        int[] result1 = solution.twoSum(nums1, target1);
        System.out.println("Test Case 1: " + java.util.Arrays.toString(result1) + " (expected: [2, 5])");

        // Test Case 2: nums = [2,3,4], target = 6, expected [1,3]
        int[] nums2 = {2, 3, 4};
        int target2 = 6;
        int[] result2 = solution.twoSum(nums2, target2);
        System.out.println("Test Case 2: " + java.util.Arrays.toString(result2) + " (expected: [1, 3])");

        // Test Case 3: nums = [-1,0,1,2], target = 1, expected [1,4]
        int[] nums3 = {-1, 0, 1, 2};
        int target3 = 1;
        int[] result3 = solution.twoSum(nums3, target3);
        System.out.println("Test Case 3: " + java.util.Arrays.toString(result3) + " (expected: [1, 4])");
    }
}