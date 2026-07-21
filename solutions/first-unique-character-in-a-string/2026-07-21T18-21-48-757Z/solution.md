```java
class Solution {
    public int firstUniqChar(String s) {
        HashMap<Character, Integer> map = new HashMap<>();

        int result = 0;

        for (int i=0; i<s.length(); i++) {
            char current = s.charAt(i);
            map.put(current, map.getOrDefault(current, 0) + 1);
        }

        System.out.println(map);

        for (int i = 0; i<s.length(); i++) {
            if (map.get(s.charAt(i)) == 1) {
                return i;
            } else {
                continue;
            }
        }

        return -1;
    }
}
```
