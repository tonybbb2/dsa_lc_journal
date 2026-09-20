```java
class Solution {
    public boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        boolean result = false;

        if (s.length() == 0) {
            return false;
        }

       for (int i=0; i < s.length(); i++) {
            if (s.charAt(i) == '{' || s.charAt(i) == '[' || s.charAt(i) == '(') {
                stack.push(s.charAt(i));
            } else {
                char top = stack.peek();

                if (stack.isEmpty()) {
                    return false;
                }

                if (top == '(' && s.charAt(i) != ')') return false;
                if (top == '{' && s.charAt(i) != '}') return false;
                if (top == '[' && s.charAt(i) != ']') return false;

                stack.pop();
            }
        }

        return stack.isEmpty();
    }
}
```
