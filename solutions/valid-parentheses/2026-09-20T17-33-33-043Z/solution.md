```java
class Solution {
    public boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();

        for (int i=0; s.length; i++) {
            stack.push(s.charAt(i));
        }

        System.out.println(stack);

        return true;

    }
}
```
