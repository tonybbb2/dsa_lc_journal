```java
class Solution {
    public String longestCommonPrefix(String[] strs) {
        if (strs == null || strs.length == 0) {
            return "";
        }

        String firstWord = strs[0];

        for (int i=1; i < strs.length; i++) {
            while (!strs[i].startsWith(firstWord)) {
                firstWord = firstWord.substring(0, firstWord.length() - 1);

                if (firstWord.isEmpty()) {
                    return "";
                }
            }
        }

        return firstWord;
    }
}
```
