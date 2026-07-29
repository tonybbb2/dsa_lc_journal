```java
/**
 * Definition for a binary tree node.
 * public class TreeNode {
 *     int val;
 *     TreeNode left;
 *     TreeNode right;
 *     TreeNode() {}
 *     TreeNode(int val) { this.val = val; }
 *     TreeNode(int val, TreeNode left, TreeNode right) {
 *         this.val = val;
 *         this.left = left;
 *         this.right = right;
 *     }
 * }
 */
class Solution {
    public List<Integer> postorderTraversal(TreeNode root) {
        List<Integer> list = new ArrayList<Integer>();

        postOrder(root, list);

        return list;
    }

    public void postOrder(TreeNode l1, List<Integer> list){
        if (l1 == null) {
            return;
        }

        postOrder(l1.left, list);
        postOrder(l1.right, list);
        list.add(l1.val);
    }
}
```
