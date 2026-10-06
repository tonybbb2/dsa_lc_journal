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
    public void reorderList(ListNode head) {
        if (head == null || head.next == null || head.next.next == null) {
            return;
        }
        
        // tail premiere moitie
        ListNode prev = null;
        // tail deuxieme moitie
        ListNode fast = head;

        // head premiere moitie
        ListNode l1 = head;
        // head deuxieme omitie
        ListNode slow = head;


        while (fast != null && fast.next != null) {
            prev = slow;
            slow = slow.next;
            fast = fast.next.next;
        }

        prev.next = null;
        
        // 1->2->3->4

        // 1->2->null
        // 3->4->null

        // maintenant je veux reverse la deuxieme
        ListNode l2 = reverse(slow);

        merge(l1, l2);
    }

        public ListNode reverse(ListNode head) {
            ListNode prev = null;

            while (head != null) {
                ListNode next_node = head.next;
                head.next = prev;
                prev = head;
                head = next_node;
            }

            return prev;
        }

        
        // 1->2->null
        // 4->3->null

        public void merge(ListNode list1, ListNode list2) {
            ListNode prev = null;

            while (list1 != null && list2 != null) {

                ListNode l1Next = list1.next; // 2
                ListNode l2Next = list2.next; // 3

                list1.next = list2; // 1->4-> (garde le 1 (tete) de la liste 1)
                list1.next.next = l1Next; // 1->4->2->null

                prev = list2; // null devient 4->
                list1 = l1Next; 
                list2 = l2Next;
            }

            if (list2 != null && prev != null) {
                prev.next = list2;
            }

        }

    }

```
