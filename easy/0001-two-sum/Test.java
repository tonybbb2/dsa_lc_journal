import java.util.Arrays;

public class Test {
    public static void main(String[] args) {
        Solution solution = new Solution();

        int[] nums1 = {11, 2, 15, 7};
        int target1 = 9;
        int[] result1 = solution.twoSum(nums1, target1);
        System.out.println("Test Case 1: " + Arrays.toString(result1) + " (expected: [1, 3])");

        int[] nums2 = {4, 2, 3};
        int target2 = 6;
        int[] result2 = solution.twoSum(nums2, target2);
        System.out.println("Test Case 2: " + Arrays.toString(result2) + " (expected: [0, 1])");

        int[] nums3 = {3, 3};
        int target3 = 6;
        int[] result3 = solution.twoSum(nums3, target3);
        System.out.println("Test Case 3: " + Arrays.toString(result3) + " (expected: [0, 1])");

        int[] nums4 = {-3, 4, 3, 90};
        int target4 = 0;
        int[] result4 = solution.twoSum(nums4, target4);
        System.out.println("Test Case 4: " + Arrays.toString(result4) + " (expected: [0, 2])");
    }
}
