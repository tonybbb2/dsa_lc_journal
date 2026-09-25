```java
class Solution {
    public int scoreOfParentheses(String s) {
        Stack<Character> stack = new Stack<>();
        int score = 0;

        for (int i=0; i < s.length(); i++) {
            char ch = s.charAt(i);

            if (ch == '(') {
                stack.push(ch);
            } else {
                char pop = stack.peek();

                if (s.length() == 0) {
                    return 0;
                }

                if (ch == ')' && pop == '(') {
                    score++;
                } 

                stack.pop();
            }
        }

        return score;
    }
}
```
