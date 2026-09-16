```java
class Solution {
    public int compress(char[] chars) {
        List<Character> ans = new ArrayList<>();
        int count = 1;

        if (chars == null || chars.length <= 1) {
            return chars.length;
        }

        for (int i=1; i < chars.length; i++) {
            if (chars[i] == chars[i-1]) {
                count++;
            } else {
                if (count > 1) {
                    ans.add(chars[i-1]);   
                    String countStr = String.valueOf(count);

for (char c : countStr.toCharArray()) {
    ans.add(c);
}
                    count = 1;
                } else {
                    ans.add(chars[i-1]);
                    count = 1;
                }
            }
        }
        
        ans.add(chars[chars.length - 1]);

        if (count > 1) {
            String countStr = String.valueOf(count);

            for (char c : countStr.toCharArray()) {
                ans.add(c);
            }
        }

        // copy back into original array
        for (int i = 0; i < ans.size(); i++) {
            chars[i] = ans.get(i);
        }

        return ans.size();
    }
}
```
