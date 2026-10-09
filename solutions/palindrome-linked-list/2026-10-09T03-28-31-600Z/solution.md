```java
/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode() {}
 *     ListNode(int val) { this.val = val; }
 *     ListNode(int val, ListNode next) { this.val = val; this.next = next; }
 * }
 */

class Solution {
    public boolean isPalindrome(ListNode head) {
        ListNode slow = head;
        ListNode fast = head;

        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
        }

        ListNode left = head;
        ListNode right = reverse(slow);

        while (left != null && right != null) {
            if (left.val != right.val) {
                return false;
            }

            left = left.next;
            right = right.next;

        }

        return true;
    }

    public ListNode reverse(ListNode l1) {
        ListNode prev = null;

        while (l1 != null) {
            ListNode curr = l1.next;
            l1.next = prev;
            prev = l1;
            l1 = curr;
        }

        return prev;
    }
}
```
