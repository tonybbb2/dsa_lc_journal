```java
class Solution {
    public boolean isPalindrome(String s) {
       String trimmed = s.replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
        int a_pointer = 0;
        int b_pointer = trimmed.length() - 1;

        while (a_pointer < b_pointer) {
            if (trimmed.charAt(a_pointer) != trimmed.charAt(b_pointer)) {
                return false;
            }

            a_pointer++;
            b_pointer--;
        }
                    
            return true;
    }
}
```
