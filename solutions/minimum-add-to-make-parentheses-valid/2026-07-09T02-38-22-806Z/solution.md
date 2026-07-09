```java
class Solution {
    public int minAddToMakeValid(String s) {
        Stack<Character> stack = new Stack<>();

        int min = 0;
        int size = s.length();

        for (int i=0; i<s.length(); i++){
            char ch = s.charAt(i);
            if (ch == '(') {
                stack.push(ch);
            } else {
                if (!stack.isEmpty() && ch == ')') {
                    stack.pop();
                } else {
                    min++;
                }
            }
        }

        return min + stack.size();
    }
}
```
