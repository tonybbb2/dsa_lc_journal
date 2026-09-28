```java
class Solution {
    public int[] asteroidCollision(int[] asteroids) {
        Stack<Integer> stack = new Stack<>();
        
        for (int i=0; i < asteroids.length; i++) {
            if (stack.isEmpty() || asteroids[i] > 0) {
                stack.push(asteroids[i]);
            } else {
                while (true) {
                    int peek = stack.peek();
                    if (peek < 0) {
                        stack.push(asteroids[i]); // push dans le stack est negatif. (ex. [-1], il va toujours vers le dehors anyways)
                        break;
                    } else if (peek > -asteroids[i]){ 
                        break;
                    } else if (peek == -asteroids[i]) { // si 8 et -8 (8), il s'annullent, donc jenleve celui qui est deja la (8)
                        stack.pop();
                        break;
                    } else {
                        stack.pop();
                        if (stack.isEmpty()) {
                            stack.push(asteroids[i]);
                            break;
                        }
                    }
                }
            }
        }

        int[] array = new int[stack.size()];

        for (int i=0; i<stack.size(); i++) {
            array[i] = stack.get(i);
        }

        return array;
    }
}
```
