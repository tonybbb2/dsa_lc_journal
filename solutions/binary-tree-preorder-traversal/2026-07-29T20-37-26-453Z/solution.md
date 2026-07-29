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
    public List<Integer> preorderTraversal(TreeNode root) {
        List<Integer> list = new ArrayList<Integer>();

        preOrder(root, list);

        return list;
    }

    public void preOrder(TreeNode l1, List<Integer> list){
        if (l1 == null) {
            return;
        }

        list.add(l1.val);
        preOrder(l1.left, list);
        preOrder(l1.right, list);
    }
}
```
