```java
class Solution {
    public String removeStars(String s) {
        Stack<Character> stack = new Stack<>();

        for (int i=0; i < s.length(); i++) {
            char ch = s.charAt(i);

            if (ch != '*') {
                stack.push(ch);
            } else {
                char peek = stack.peek();

                if (peek != '*') {
                    stack.pop();
                }
            }
        }

        String result = "";

        for (int i=0; i < stack.size(); i++) {
            result += String.valueOf(stack.get(i));
        }

        return result; 
    }
}
```
